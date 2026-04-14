// gemini.provider.ts
import { GoogleGenAI } from "@google/genai";
import { pool } from "../../../db/pool.js";
import { parsePdf } from "../../../middleware/parserPDF.js";
import { generateFromGeminiText } from "./geminiText.js";
import {
  parseCandidateEvals,
  parseJobProfile,
} from "./schemas.js";
import {
  buildCandidatesEvaluationPrompt,
  buildJobProfileFromTextPrompt,
} from "../prompts/prompts.js";
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
  "evaluations": [{
    "candidate_id": string,
    "candidate_name": string,
    "summary": string,
    "qualified": boolean,
    "overall_score": number,
    "strengths": [{"point": string, "explanation": string}],
    "gaps": [{"point": string, "explanation": string}],
    "unknowns": [{"point": string, "explanation": string}]
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

  return {
    kind: "gemini" as const,

    async loadCandidates(limit: number): Promise<CandidateWithCvText[]> {
      return loadCandidatesWithCv(limit);
    },

    async getJobDescriptionText(input: JobDescriptionInput): Promise<string> {
      if (input.mode === "text") {
        return input.text;
      }

      return parsePdf(input.file);
    },

    async createJobProfile(
      _input: JobDescriptionInput,
      jobDescriptionText: string,
    ): Promise<JobProfile> {
      void _input;

      const prompt = buildJobProfileFromTextPrompt(jobDescriptionText);
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
    },

    async evaluateCandidates(params: {
      candidatesWithCv: CandidateWithCvText[];
      jobProfile: JobProfile;
    }): Promise<CandidateEval[]> {
      const { candidatesWithCv, jobProfile } = params;
      if (candidatesWithCv.length === 0) {
        return [];
      }

      const evalPrompt = buildCandidatesEvaluationPrompt({
        jobProfile,
        candidates: candidatesWithCv.map((candidateWithCv) => {
          const candidate = candidateWithCv.candidate;
          return {
            candidateId: String(candidate.id),
            candidateLabel: candidate.name ?? `candidate-${candidate.id}`,
            cvText: candidateWithCv.cvText,
          };
        }),
      });

      const evalText = await generateFromGeminiText({
        ai,
        model: MODEL_NAME,
        prompt: evalPrompt,
        forceJsonResponse: true,
      });

      return parseGeminiJsonWithRepair({
        ai,
        model: MODEL_NAME,
        rawText: evalText,
        schemaDescription: CANDIDATE_EVAL_SCHEMA_DESCRIPTION,
        parse: parseCandidateEvals,
        label: "candidate evaluations",
      });
    },

    async cleanup(): Promise<void> {
      return;
    },
  };
}
