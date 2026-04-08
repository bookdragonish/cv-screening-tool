// gemini.provider.ts
import { GoogleGenAI } from "@google/genai";
import { pool } from "../../../db/pool.js";
import {
  deleteGeminiFiles,
  generateFromGeminiOnFiles,
} from "./geminiGenerate.js";
import { generateFromGeminiText } from "./geminiText.js";
import {
  parseCandidateEval,
  parseJobProfile,
  parseRanking,
} from "./schemas.js";
import {
  buildCandidateEvalPrompt,
  buildJobAdProfilePrompt,
  buildJobProfileFromPdfPrompt,
  buildRankingPrompt,
} from "./prompts/prompts.js";
import {
  uploadFilesToGemini,
  type UploadedGeminiFile,
} from "./uploadFilesToGemini.js";
import type {
  ApiCandidate,
  CandidateEval,
  CandidateWithCvText,
  JobDescriptionInput,
  JobProfile,
} from "../../../types/ai.types.js";

const MODEL_NAME = "gemini-2.5-flash";
const JOB_PROFILE_SCHEMA_DESCRIPTION = `{
  "role_title": string,
  "must_haves": string[],
  "nice_to_haves": string[]
}`;
const CANDIDATE_EVAL_SCHEMA_DESCRIPTION = `{
  "candidate_id": string,
  "candidate_label": string,
  "candidate_role": string,
  "contact_phone": string,
  "qualified": boolean,
  "overall_score": number,
  "experience_highlights": string[],
  "education": string[],
  "strengths": [{"point": string, "evidence": string}],
  "gaps": [{"point": string, "evidence": string, "impact": "high"|"medium"|"low"}],
  "unknowns": string[]
}`;
const RANKING_SCHEMA_DESCRIPTION = `{
  "role_title": string,
  "ranking": [{
    "rank": number,
    "candidate_id": string,
    "candidate_label": string,
    "overall_score": number,
    "qualified": boolean,
    "summary": string
  }]
}`;

function createGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Mangler GEMINI_API_KEY.");
  }

  return new GoogleGenAI({ apiKey });
}

async function loadCandidatesWithCv(limit: number): Promise<CandidateWithCvText[]> {
  const r = await pool.query(
    "select id, name, email, created_at, cv_markdown from candidates where cv_markdown is not null and btrim(cv_markdown) <> '' order by id desc limit $1",
    [limit],
  );

  const rows = r.rows as ApiCandidate[];

  return rows
    .map((candidate) => {
      const cvText = candidate.cv_markdown?.trim();
      if (!cvText) return null;

      return { candidate, cvText };
    })
    .filter((item): item is CandidateWithCvText => item !== null);
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function parseGeminiJsonWithRepair<T>(params: {
  ai: GoogleGenAI;
  model: string;
  rawText: string;
  schemaDescription: string;
  parse: (text: string) => T;
  label: string;
}): Promise<T> {
  const { ai, model, rawText, schemaDescription, parse, label } = params;

  try {
    return parse(rawText);
  } catch (firstError) {
    const repairPrompt = [
      "You are a strict JSON formatter.",
      "Convert the content below into a valid JSON object matching the schema.",
      "Return only JSON.",
      "Use double quotes for all keys and string values.",
      "Do not add markdown code fences.",
      "",
      "Schema:",
      schemaDescription,
      "",
      "Content to repair:",
      rawText,
    ].join("\n");

    const repairedText = await generateFromGeminiText({
      ai,
      model,
      prompt: repairPrompt,
      forceJsonResponse: true,
    });

    try {
      return parse(repairedText);
    } catch (repairError) {
      const rawPreview =
        rawText.length > 1200 ? `${rawText.slice(0, 1200)}...` : rawText;
      throw new Error(
        [
          `Gemini returned invalid JSON for ${label}.`,
          `First parse error: ${toErrorMessage(firstError)}`,
          `Repair parse error: ${toErrorMessage(repairError)}`,
          `Raw response preview:`,
          rawPreview,
        ].join("\n"),
        { cause: repairError },
      );
    }
  }
}

export function createGeminiProvider() {
  const ai = createGeminiClient();
  const uploadedFilesForCleanup: UploadedGeminiFile[] = [];

  return {
    kind: "gemini" as const,

    async loadCandidates(limit: number): Promise<CandidateWithCvText[]> {
      return loadCandidatesWithCv(limit);
    },

    async getJobDescriptionText(input: JobDescriptionInput): Promise<string> {
      if (input.mode === "text") {
        return input.text;
      }

      return input.originalName || "PDF job description";
    },

    async createJobProfile(
      input: JobDescriptionInput,
      _jobDescriptionText: string,
    ): Promise<JobProfile> {
      void _jobDescriptionText;

      if (input.mode === "text") {
        const prompt = buildJobAdProfilePrompt(input.text);
        const jobProfileText = await generateFromGeminiText({
          ai,
          model: MODEL_NAME,
          prompt,
          forceJsonResponse: true,
        });

        return parseGeminiJsonWithRepair({
          ai,
          model: MODEL_NAME,
          rawText: jobProfileText,
          schemaDescription: JOB_PROFILE_SCHEMA_DESCRIPTION,
          parse: parseJobProfile,
          label: "job profile",
        });
      }

      const jobFile = new File(
        [Uint8Array.from(input.file)],
        input.originalName || "job-description.pdf",
        { type: "application/pdf" },
      );

      const uploadedJobFiles = await uploadFilesToGemini(ai, [jobFile]);
      const uploadedJobFile = uploadedJobFiles[0];

      if (!uploadedJobFile) {
        throw new Error(
          "Kunne ikke laste opp stillingsbeskrivelsen til Gemini.",
        );
      }

      uploadedFilesForCleanup.push(uploadedJobFile);

      const jobProfileText = await generateFromGeminiOnFiles({
        ai,
        model: MODEL_NAME,
        files: [uploadedJobFile],
        prompt: buildJobProfileFromPdfPrompt(),
        labelFiles: false,
        forceJsonResponse: true,
      });

      return parseGeminiJsonWithRepair({
        ai,
        model: MODEL_NAME,
        rawText: jobProfileText,
        schemaDescription: JOB_PROFILE_SCHEMA_DESCRIPTION,
        parse: parseJobProfile,
        label: "job profile from PDF",
      });
    },

    async evaluateCandidates(params: {
      candidatesWithCv: CandidateWithCvText[];
      jobProfile: JobProfile;
    }): Promise<CandidateEval[]> {
      const { candidatesWithCv, jobProfile } = params;
      const evals: CandidateEval[] = [];

      for (const candidateWithCv of candidatesWithCv) {
        const candidate = candidateWithCv.candidate;

        const evalPrompt = buildCandidateEvalPrompt({
          jobProfile,
          candidateId: String(candidate.id),
          candidateLabel: candidate.name ?? `candidate-${candidate.id}`,
          cvText: candidateWithCv.cvText,
        });

        const evalText = await generateFromGeminiText({
          ai,
          model: MODEL_NAME,
          prompt: evalPrompt,
          forceJsonResponse: true,
        });

        const parsedEval = await parseGeminiJsonWithRepair({
          ai,
          model: MODEL_NAME,
          rawText: evalText,
          schemaDescription: CANDIDATE_EVAL_SCHEMA_DESCRIPTION,
          parse: parseCandidateEval,
          label: `candidate evaluation for candidate ${candidate.id}`,
        });

        evals.push(parsedEval);
      }

      return evals;
    },

    async rankCandidates(params: {
      jobProfile: JobProfile;
      evals: CandidateEval[];
      candidatesWithCv: CandidateWithCvText[];
    }): Promise<ReturnType<typeof parseRanking>> {
      const { jobProfile, evals } = params;

      const rankingPrompt = buildRankingPrompt({ jobProfile, evals });
      const rankingText = await generateFromGeminiText({
        ai,
        model: MODEL_NAME,
        prompt: rankingPrompt,
        forceJsonResponse: true,
      });

      return parseGeminiJsonWithRepair({
        ai,
        model: MODEL_NAME,
        rawText: rankingText,
        schemaDescription: RANKING_SCHEMA_DESCRIPTION,
        parse: parseRanking,
        label: "candidate ranking",
      });
    },

    async cleanup(): Promise<void> {
      if (!uploadedFilesForCleanup.length) return;

      await deleteGeminiFiles(ai, uploadedFilesForCleanup).catch((error) => {
        console.warn("Kunne ikke slette Gemini-filer etter screening:", error);
      });
    },
  };
}
