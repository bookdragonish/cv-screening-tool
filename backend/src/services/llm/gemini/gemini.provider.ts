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
  CandidateWithCv,
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

function sanitizeFileName(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "_");
}

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

      const baseName = sanitizeFileName(
        candidate.name?.trim() || `candidate-${candidate.id}`,
      );

      const file = new File([Uint8Array.from(pdfBuffer)], `${baseName}.pdf`, {
        type: "application/pdf",
      });

      return { candidate, file };
    })
    .filter((item): item is CandidateWithCv => item !== null);
}

export function createGeminiProvider() {
  const ai = createGeminiClient();
  const uploadedFilesForCleanup: UploadedGeminiFile[] = [];

  return {
    kind: "gemini" as const,

    async loadCandidates(limit: number): Promise<CandidateWithCv[]> {
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
      if (input.mode === "text") {
        const prompt = buildJobAdProfilePrompt(input.text);
        const jobProfileText = await generateFromGeminiText({
          ai,
          model: MODEL_NAME,
          prompt,
        });

        return parseJobProfile(jobProfileText);
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
      });

      return parseJobProfile(jobProfileText);
    },

    async evaluateCandidates(params: {
      candidatesWithCv: CandidateWithCv[];
      jobProfile: JobProfile;
    }): Promise<CandidateEval[]> {
      const { candidatesWithCv, jobProfile } = params;

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

      return evals;
    },

    async rankCandidates(params: {
      jobProfile: JobProfile;
      evals: CandidateEval[];
      candidatesWithCv: CandidateWithCv[];
    }): Promise<ReturnType<typeof parseRanking>> {
      const { jobProfile, evals } = params;

      const rankingPrompt = buildRankingPrompt({ jobProfile, evals });
      const rankingText = await generateFromGeminiText({
        ai,
        model: MODEL_NAME,
        prompt: rankingPrompt,
      });

      return parseRanking(rankingText);
    },

    async cleanup(): Promise<void> {
      if (!uploadedFilesForCleanup.length) return;

      await deleteGeminiFiles(ai, uploadedFilesForCleanup).catch((error) => {
        console.warn("Kunne ikke slette Gemini-filer etter screening:", error);
      });
    },
  };
}
