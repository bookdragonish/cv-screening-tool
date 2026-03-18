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
  buildJobAdProfilePrompt,
} from "../prompts/prompts.js";
import type {
  ApiCandidate,
  CandidateEval,
  CandidateWithCvText,
  JobDescriptionInput,
  JobProfile,
} from "../../../types/ai.types.js";

const MODEL_NAME = "gemini-2.5-flash";

function createGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Mangler GEMINI_API_KEY.");
  }

  return new GoogleGenAI({ apiKey });
}

async function loadCandidatesWithCv(limit: number): Promise<CandidateWithCvText[]> {
  const r = await pool.query(
    "select id, name, email, created_at, cv_pdf from candidates where cv_pdf is not null order by id desc limit $1",
    [limit],
  );

  const rows = r.rows as ApiCandidate[];
  const candidatesWithText: CandidateWithCvText[] = [];

  for (const candidate of rows) {
    const pdfBuffer = candidate.cv_pdf;
    const cvText = await parsePdf(pdfBuffer);
    candidatesWithText.push({ candidate, cvText });
  }

  return candidatesWithText;
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
      const prompt = buildJobAdProfilePrompt(jobDescriptionText);
      const jobProfileText = await generateFromGeminiText({
        ai,
        model: MODEL_NAME,
        prompt,
      });

      return parseJobProfile(jobProfileText);
    },

    async evaluateCandidates(params: {
      candidatesWithCv: CandidateWithCvText[];
      jobProfile: JobProfile;
    }): Promise<CandidateEval[]> {
      const { candidatesWithCv, jobProfile } = params;

      const evalPrompt = buildCandidatesEvaluationPrompt({
        jobProfile,
        candidates: candidatesWithCv.map((item) => ({
          candidateId: String(item.candidate.id),
          candidateLabel: item.candidate.name ?? `candidate-${item.candidate.id}`,
          cvText: item.cvText,
        })),
      });

      const evalText = await generateFromGeminiText({
        ai,
        model: MODEL_NAME,
        prompt: evalPrompt,
      });

      return parseCandidateEvals(evalText);
    },

    async cleanup(): Promise<void> {
      return;
    },
  };
}
