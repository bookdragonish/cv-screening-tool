import { GoogleGenAI } from "@google/genai";
import type { NextFunction, Request, Response } from "express";

import { pool } from "../db/pool.js";
import { deleteGeminiFiles, generateFromGeminiOnFiles } from "../services/llm/gemini/geminiGenerate.js";
import { generateFromGeminiText } from "../services/llm/gemini/geminiText.js";
import { parseCandidateEval, parseJobProfile, parseRanking } from "../services/llm/gemini/schemas.js";
import type { CandidateEval, JobProfile } from "../types/GeminiTypes.js";
import {
  type UploadedGeminiFile,
  uploadFilesToGemini,
} from "../services/llm/gemini/uploadFilesToGemini.js";
import {
  buildCandidateEvalPrompt,
  buildJobAdProfilePrompt,
  buildJobProfileFromPdfPrompt,
  buildRankingPrompt,
} from "../services/llm/gemini/prompts/prompts.js";

type ApiCandidate = {
  id: number;
  name?: string | null;
  email?: string | null;
  created_at?: string;
  cv_pdf: Buffer;
};

type CandidateWithCv = {
  candidate: ApiCandidate;
  file: File;
};

type ScreeningCandidate = {
  id: number;
  rank: number;
  name: string;
  role: string;
  score: number;
  met: string[];
  missing: string[];
  summary: string;
  experience: string[];
  education: string[];
  email: string;
  phone: string;
};

type SaveScreeningRunPayload = {
  title: string;
  header: string;
  description: string;
  hardQualifications: string[];
  softQualifications: string[];
  candidates: Array<{
    candidateId: number;
    rank: number;
    score: number;
    qualified: boolean;
    qualificationsMet: string[];
    qualificationsMissing: string[];
    summary?: string;
  }>;
};

type RunScreeningResponse = {
  screeningRecord: SaveScreeningRunPayload;
  requiredSkills: string[];
  candidates: ScreeningCandidate[];
};

type JobDescriptionInput =
  | { mode: "text"; text: string }
  | { mode: "pdf"; file: File; originalName: string };

const MAX_CANDIDATES_PER_RUN = 20;
const MODEL_NAME = "gemini-2.5-flash";
const DEFAULT_TEXT_JOB_TITLE = "Innlimt stillingsbeskrivelse";

/**
 * Returns a clean string.
 *
 * - Trims whitespace
 * - Returns empty string if value is null/undefined
 */
function normalizeString(value: string | undefined | null): string {
  return value?.trim() ?? "";
}

/**
 * Cleans a list of strings.
 *
 * - Trims each item
 * - Removes empty items
 * - Removes duplicates
 */
function normalizeStringList(values: string[] | undefined): string[] {
  if (!values?.length) return [];

  return Array.from(new Set(values.map((value) => normalizeString(value)).filter(Boolean)));
}

/**
 * Returns a fallback title if Gemini does not provide one.
 */
function getFallbackJobTitle(jobDescriptionInput: JobDescriptionInput): string {
  if (jobDescriptionInput.mode === "pdf") {
    return jobDescriptionInput.originalName.replace(/\.pdf$/i, "") || "Screening";
  }

  return DEFAULT_TEXT_JOB_TITLE;
}

/**
 * Creates a Gemini client with the API key from backend env.
 */
function createGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Mangler GEMINI_API_KEY.");
  }

  return new GoogleGenAI({ apiKey });
}

/**
 * Converts a name to a safe filename.
 */
function sanitizeFileName(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "_");
}

/**
 * Loads candidates with CV PDFs from the database and converts them to files
 * that Gemini can read.
 */
async function loadCandidatesWithCv(limit: number): Promise<CandidateWithCv[]> {
  const r = await pool.query(
    "select id, name, email, created_at, cv_pdf from candidates where cv_pdf is not null order by id desc limit $1",
    [limit],
  );

  const rows = r.rows as ApiCandidate[];

  return rows
    .map((candidate) => {
      const pdfBuffer = candidate.cv_pdf;
      if (!Buffer.isBuffer(pdfBuffer) || !pdfBuffer.length) return null;

      const baseName = sanitizeFileName(candidate.name?.trim() || `candidate-${candidate.id}`);
      const file = new File([Uint8Array.from(pdfBuffer)], `${baseName}.pdf`, {
        type: "application/pdf",
      });
      return { candidate, file };
    })
    .filter((item): item is CandidateWithCv => item !== null);
}

/**
 * Builds a structured job profile from either:
 * - pasted job description text
 * - uploaded job description PDF
 */
async function createJobProfile(
  ai: GoogleGenAI,
  jobDescriptionInput: JobDescriptionInput,
  uploadedFilesForCleanup: UploadedGeminiFile[],
): Promise<JobProfile> {
  if (jobDescriptionInput.mode === "text") {
    const jobPrompt = buildJobAdProfilePrompt(jobDescriptionInput.text);
    const jobProfileText = await generateFromGeminiText({
      ai,
      model: MODEL_NAME,
      prompt: jobPrompt,
    });

    return parseJobProfile(jobProfileText);
  }

  const uploadedJobFiles = await uploadFilesToGemini(ai, [jobDescriptionInput.file]);
  const uploadedJobFile = uploadedJobFiles[0];
  if (!uploadedJobFile) {
    throw new Error("Kunne ikke laste opp stillingsbeskrivelsen til Gemini.");
  }

  uploadedFilesForCleanup.push(uploadedJobFile);

  const jobProfileText = await generateFromGeminiOnFiles({
    ai,
    model: MODEL_NAME,
    files: [uploadedJobFile],
    prompt: buildJobProfileFromPdfPrompt(),
    labelFiles: false,
  });

  return parseJobProfile(jobProfileText);
}

/**
 * Builds the candidate list returned to the frontend.
 *
 * Uses the ranking result plus each candidate evaluation.
 */
function mapToScreeningCandidates(params: {
  ranking: ReturnType<typeof parseRanking>;
  evals: CandidateEval[];
  candidatesWithCv: CandidateWithCv[];
}): ScreeningCandidate[] {
  const { ranking, evals, candidatesWithCv } = params;

  const dbCandidatesById = new Map(
    candidatesWithCv.map((item) => [String(item.candidate.id), item.candidate]),
  );
  const evalByCandidateId = new Map(evals.map((item) => [item.candidate_id, item]));

  return ranking.ranking
    .map((rankedItem, index) => {
      const dbCandidate = dbCandidatesById.get(rankedItem.candidate_id);
      if (!dbCandidate) return null;

      const evalResult = evalByCandidateId.get(rankedItem.candidate_id);
      const met = evalResult?.strengths.map((item) => item.point).filter(Boolean) ?? [];
      const missing = evalResult?.gaps.map((item) => item.point).filter(Boolean) ?? [];
      const experience = evalResult?.strengths.map((item) => item.evidence).filter(Boolean) ?? [];
      const unknowns = evalResult?.unknowns.filter(Boolean) ?? [];

      const normalizedScore = Math.max(0, Math.min(100, Math.round(rankedItem.overall_score)));

      return {
        id: dbCandidate.id,
        rank: rankedItem.rank ?? index + 1,
        name: dbCandidate.name?.trim() || `Kandidat ${dbCandidate.id}`,
        role: evalResult?.candidate_role?.trim() || "Kandidat",
        score: normalizedScore,
        met: met.length ? met : ["Ingen tydelige kvalifikasjonstreff funnet."],
        missing,
        summary: rankedItem.summary || "Ingen oppsummering tilgjengelig.",
        experience: evalResult?.experience_highlights?.length
          ? evalResult.experience_highlights.slice(0, 4)
          : experience.length
            ? experience.slice(0, 4)
            : ["Ikke oppgitt i CV."],
        education: evalResult?.education?.length
          ? evalResult.education.slice(0, 3)
          : unknowns.length
            ? unknowns.slice(0, 3)
            : ["Ikke spesifisert i analysen."],
        email: dbCandidate.email ?? "Ikke oppgitt",
        phone: evalResult?.contact_phone?.trim() || "Ikke oppgitt",
      };
    })
    .filter((item): item is ScreeningCandidate => item !== null)
    .sort((a, b) => a.rank - b.rank);
}

/**
 * Builds the payload that will be saved by /api/results/screenings.
 */
function buildScreeningRecord(params: {
  jobDescriptionInput: JobDescriptionInput;
  jobProfile: JobProfile;
  ranking: ReturnType<typeof parseRanking>;
  evals: CandidateEval[];
  candidatesWithCv: CandidateWithCv[];
}): SaveScreeningRunPayload {
  const { jobDescriptionInput, jobProfile, ranking, evals, candidatesWithCv } = params;

  const dbCandidatesById = new Map(
    candidatesWithCv.map((item) => [String(item.candidate.id), item.candidate]),
  );
  const evalByCandidateId = new Map(evals.map((item) => [item.candidate_id, item]));

  const title = normalizeString(jobProfile.role_title) || getFallbackJobTitle(jobDescriptionInput);
  const hardQualifications = normalizeStringList(jobProfile.must_haves);
  const softQualifications = normalizeStringList(jobProfile.nice_to_haves);
  const candidates: SaveScreeningRunPayload["candidates"] = [];

  for (const [index, rankedItem] of ranking.ranking.entries()) {
    const dbCandidate = dbCandidatesById.get(rankedItem.candidate_id);
    if (!dbCandidate) continue;

    const evalResult = evalByCandidateId.get(rankedItem.candidate_id);
    const met = normalizeStringList(evalResult?.strengths.map((item) => item.point));
    const missing = normalizeStringList(evalResult?.gaps.map((item) => item.point));
    const normalizedScore = Math.max(0, Math.min(100, Math.round(rankedItem.overall_score)));

    candidates.push({
      candidateId: dbCandidate.id,
      rank: rankedItem.rank ?? index + 1,
      score: normalizedScore,
      qualified: rankedItem.qualified,
      qualificationsMet: met.length ? met : ["Ingen tydelige kvalifikasjonstreff funnet."],
      qualificationsMissing: missing,
      summary: normalizeString(rankedItem.summary) || "Ingen oppsummering tilgjengelig.",
    });
  }

  candidates.sort((a, b) => a.rank - b.rank);

  return {
    title,
    header: title,
    description:
      jobDescriptionInput.mode === "text"
        ? normalizeString(jobDescriptionInput.text) || `Stillingsbeskrivelse for ${title}`
        : `Analysert fra opplastet PDF: ${jobDescriptionInput.originalName}`,
    hardQualifications,
    softQualifications,
    candidates,
  };
}

/**
 * Reads candidateLimit and keeps it inside allowed bounds.
 */
function parseCandidateLimit(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return MAX_CANDIDATES_PER_RUN;
  return Math.max(1, Math.min(MAX_CANDIDATES_PER_RUN, Math.floor(parsed)));
}

/**
 * Reads and validates the job description input from the request.
 *
 * Accepted inputs:
 * - mode="text": requires 'jobDescriptionText'
 * - mode="pdf": requires 'jobDescriptionFile' (application/pdf)
 *
 * Returns:
 * - JobDescriptionInput on success
 * - { error, status } on validation failure
 */
function parseJobDescriptionInput(req: Request): JobDescriptionInput | { error: string; status: number } {
  const mode = typeof req.body.mode === "string" ? req.body.mode : "";

  if (mode === "text") {
    const text = typeof req.body.jobDescriptionText === "string" ? req.body.jobDescriptionText.trim() : "";
    if (!text) {
      return { error: "jobDescriptionText er påkrevd når mode er 'text'.", status: 400 };
    }

    return { mode: "text", text };
  }

  if (mode === "pdf") {
    if (!req.file) {
      return { error: "jobDescriptionFile (PDF) mangler.", status: 400 };
    }

    if (req.file.mimetype !== "application/pdf") {
      return { error: "Kun PDF-filer er støttet for jobDescriptionFile.", status: 415 };
    }

    const originalName = req.file.originalname || "job-description.pdf";
    const file = new File([Uint8Array.from(req.file.buffer)], originalName, {
      type: "application/pdf",
    });
    return { mode: "pdf", file, originalName };
  }

  return { error: "mode må være enten 'text' eller 'pdf'.", status: 400 };
}

/**
 * Runs the full Gemini screening flow.
 *
 * Workflow:
 * - Parse job description input (text or PDF)
 * - Build job profile from description
 * - Evaluate each candidate CV against job profile
 * - Rank all candidates
 * - Return normalized screening payload for persistence + UI
 *
 * Responses:
 * - 200: JSON object with screeningRecord, requiredSkills, and candidates
 * - 400: Invalid input, no CV candidates, or no matchable ranking result
 * - 415: Unsupported job description file type
 */
export async function runScreeningWithGemini(req: Request, res: Response, next: NextFunction) {
  const parsedInput = parseJobDescriptionInput(req);
  if ("error" in parsedInput) {
    return res.status(parsedInput.status).json({ error: parsedInput.error });
  }

  const candidateLimit = parseCandidateLimit(req.body.candidateLimit);
  const ai = createGeminiClient();
  const uploadedFilesForCleanup: UploadedGeminiFile[] = [];

  try {
    const candidatesWithCv = await loadCandidatesWithCv(candidateLimit);
    if (!candidatesWithCv.length) {
      return res.status(400).json({ error: "Fant ingen kandidater med tilgjengelig CV i databasen." });
    }

    const jobProfile = await createJobProfile(ai, parsedInput, uploadedFilesForCleanup);

    const uploadedCandidateFiles = await uploadFilesToGemini(
      ai,
      candidatesWithCv.map((item) => item.file),
    );
    uploadedFilesForCleanup.push(...uploadedCandidateFiles);

    const evals: CandidateEval[] = [];
    for (let i = 0; i < uploadedCandidateFiles.length; i += 1) {
      const uploadedFile = uploadedCandidateFiles[i];
      const candidateWithCv = candidatesWithCv[i];

      if (!uploadedFile || !candidateWithCv) {
        throw new Error("Mangler kandidatdata under evaluering.");
      }

      const candidate = candidateWithCv.candidate;

      const evalPrompt = buildCandidateEvalPrompt({
        jobProfile,
        candidateId: String(candidate.id),
        candidateLabel: candidate.name ?? uploadedFile.displayName,
      });

      const evalText = await generateFromGeminiOnFiles({
        ai,
        model: MODEL_NAME,
        files: [uploadedFile],
        prompt: evalPrompt,
        labelFiles: false,
      });

      evals.push(parseCandidateEval(evalText));
    }

    const rankingPrompt = buildRankingPrompt({ jobProfile, evals });
    const rankingText = await generateFromGeminiText({
      ai,
      model: MODEL_NAME,
      prompt: rankingPrompt,
    });
    const ranking = parseRanking(rankingText);

    const candidates = mapToScreeningCandidates({
      ranking,
      evals,
      candidatesWithCv,
    });

    if (!candidates.length) {
      return res
        .status(400)
        .json({ error: "Fant ingen kandidater som kunne matches mot screeningresultatet." });
    }

    const screeningRecord = buildScreeningRecord({
      jobDescriptionInput: parsedInput,
      jobProfile,
      ranking,
      evals,
      candidatesWithCv,
    });

    const requiredSkills = Array.from(
      new Set(
        [...jobProfile.must_haves, ...jobProfile.nice_to_haves]
          .map((item) => item.trim())
          .filter(Boolean),
      ),
    );

    const result: RunScreeningResponse = {
      screeningRecord,
      requiredSkills,
      candidates,
    };

    return res.status(200).json(result);
  } catch (e) {
    return next(e);
  } finally {
    if (uploadedFilesForCleanup.length) {
      await deleteGeminiFiles(ai, uploadedFilesForCleanup).catch((error) => {
        console.warn("Kunne ikke slette Gemini-filer etter screening:", error);
      });
    }
  }
}
