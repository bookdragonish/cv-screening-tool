import { GoogleGenAI } from "@google/genai";

import { getAllCandidates } from "@/api/fetchCandidates";
import { getPDFBlob } from "@/api/fetchPDF";
import type { SaveScreeningRunPayload } from "@/api/fetchScreenings";
import { generateFromGeminiOnFiles, deleteGeminiFiles } from "@/api/gemini/geminiGenerate";
import { generateFromGeminiText } from "@/api/gemini/geminiText";
import { parseCandidateEval, parseJobProfile, parseRanking } from "@/api/gemini/lib/schemas";
import type { CandidateEval, JobProfile } from "@/api/gemini/lib/types";
import {
  buildCandidateEvalPrompt,
  buildJobAdProfilePrompt,
  buildJobProfileFromPdfPrompt,
  buildRankingPrompt,
} from "@/api/gemini/prompts/prompts";
import {
  uploadMultipleFilesToGemini,
  type UploadedGeminiFile,
} from "@/api/gemini/multipleFileUpload";
import type { JobDescriptionInput } from "@/components/newScreening/UploadJobDescriptionSchema";
import type { ScreeningCandidate } from "@/types/newScreeningTypes";

type ApiCandidate = {
  id: number;
  name?: string | null;
  email?: string | null;
  created_at?: string;
};

type CandidateWithCv = {
  candidate: ApiCandidate;
  file: File;
};

type RunScreeningResult = {
  candidates: ScreeningCandidate[];
  requiredSkills: string[];
  screeningRecord: SaveScreeningRunPayload;
};

const MAX_CANDIDATES_PER_RUN = 20;
const MODEL_NAME = "gemini-2.5-flash";
const DEFAULT_TEXT_JOB_TITLE = "Innlimt stillingsbeskrivelse";

function normalizeString(value: string | undefined | null): string {
  return value?.trim() ?? "";
}

function normalizeStringList(values: string[] | undefined): string[] {
  if (!values?.length) return [];

  return Array.from(
    new Set(values.map((value) => normalizeString(value)).filter(Boolean)),
  );
}

function getFallbackJobTitle(jobDescriptionInput: JobDescriptionInput): string {
  if (jobDescriptionInput.mode === "pdf") {
    return jobDescriptionInput.file.name.replace(/\.pdf$/i, "") || "Screening";
  }

  return DEFAULT_TEXT_JOB_TITLE;
}

function createGeminiClient(): GoogleGenAI {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Mangler VITE_GEMINI_API_KEY");
  }
  return new GoogleGenAI({ apiKey });
}

async function loadCandidatesWithCv(limit: number): Promise<CandidateWithCv[]> {
  const apiCandidates = (await getAllCandidates()) as ApiCandidate[];
  if (!Array.isArray(apiCandidates)) return [];

  const candidates = apiCandidates.slice(0, limit);

  const withCv = await Promise.all(
    candidates.map(async (candidate) => {
      const blob = await getPDFBlob(String(candidate.id));
      if (!blob) return null;

      const baseName = (candidate.name?.trim() || `candidate-${candidate.id}`).replace(
        /[^a-zA-Z0-9._-]+/g,
        "_",
      );
      const file = new File([blob], `${baseName}.pdf`, { type: "application/pdf" });

      return { candidate, file };
    }),
  );

  return withCv.filter((item): item is CandidateWithCv => item !== null);
}

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

  const [uploadedJobFile] = await uploadMultipleFilesToGemini(ai, [jobDescriptionInput.file]);
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

function buildScreeningRecord(params: {
  jobDescriptionInput: JobDescriptionInput;
  jobProfile: JobProfile;
  ranking: ReturnType<typeof parseRanking>;
  evals: CandidateEval[];
  candidatesWithCv: CandidateWithCv[];
}): SaveScreeningRunPayload {
  const {
    jobDescriptionInput,
    jobProfile,
    ranking,
    evals,
    candidatesWithCv,
  } = params;

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
        : `Analysert fra opplastet PDF: ${jobDescriptionInput.file.name}`,
    hardQualifications,
    softQualifications,
    candidates,
  };
}

export async function runScreeningWithGemini(params: {
  jobDescriptionInput: JobDescriptionInput;
  candidateLimit?: number;
}): Promise<RunScreeningResult> {
  const { jobDescriptionInput, candidateLimit = MAX_CANDIDATES_PER_RUN } = params;

  const ai = createGeminiClient();
  const uploadedFilesForCleanup: UploadedGeminiFile[] = [];

  try {
    const candidatesWithCv = await loadCandidatesWithCv(candidateLimit);
    if (!candidatesWithCv.length) {
      throw new Error("Fant ingen kandidater med tilgjengelig CV i databasen.");
    }

    const jobProfile = await createJobProfile(ai, jobDescriptionInput, uploadedFilesForCleanup);

    const uploadedCandidateFiles = await uploadMultipleFilesToGemini(
      ai,
      candidatesWithCv.map((item) => item.file),
    );
    uploadedFilesForCleanup.push(...uploadedCandidateFiles);

    const evals: CandidateEval[] = [];

    for (let i = 0; i < uploadedCandidateFiles.length; i += 1) {
      const uploadedFile = uploadedCandidateFiles[i];
      const candidate = candidatesWithCv[i].candidate;

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

    const screeningCandidates = mapToScreeningCandidates({
      ranking,
      evals,
      candidatesWithCv,
    });
    if (!screeningCandidates.length) {
      throw new Error("Fant ingen kandidater som kunne matches mot screeningresultatet.");
    }

    const screeningRecord = buildScreeningRecord({
      jobDescriptionInput,
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

    if (!requiredSkills.length && screeningCandidates.length) {
      requiredSkills.push(...screeningCandidates[0].met.slice(0, 5));
    }

    return {
      candidates: screeningCandidates,
      requiredSkills,
      screeningRecord,
    };
  } finally {
    if (uploadedFilesForCleanup.length) {
      await deleteGeminiFiles(ai, uploadedFilesForCleanup).catch((error) => {
        console.warn("Kunne ikke slette Gemini-filer etter screening:", error);
      });
    }
  }
}
