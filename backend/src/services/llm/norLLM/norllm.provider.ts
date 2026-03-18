// services/llm/providers/norllm/norllm.provider.ts
import { parsePdf } from "../../../middleware/parserPDF.js";
import { pool } from "../../../db/pool.js";
import {
  buildCandidatesEvaluationPrompt,
  buildJobProfileFromTextPrompt,
} from "../prompts/prompts.js";
import {
  parseCandidateEvals,
  parseJobProfile,
} from "../gemini/schemas.js";

import type {
  ApiCandidate,
  CandidateEval,
  CandidateWithCvText,
  JobDescriptionInput,
  JobProfile,
} from "../../../types/ai.types.js";
import { callNorLlm, parseNorLlmJsonWithRepair } from "../norllm/norllm.client.js";

export function createNorllmProvider() {
  return {
    kind: "norllm" as const,

    async loadCandidates(limit: number): Promise<CandidateWithCvText[]> {
      const result = await pool.query(
        "select id, name, email, cv_pdf from candidates where cv_pdf is not null order by id desc limit $1",
        [limit],
      );

      const rows = result.rows as ApiCandidate[];
      const candidatesWithText: CandidateWithCvText[] = [];

      for (const candidate of rows) {
        const pdfBuffer = candidate.cv_pdf;

        if (!Buffer.isBuffer(pdfBuffer) || !pdfBuffer.length) {
          continue;
        }

        const cvText = await parsePdf(pdfBuffer);
        if (!cvText.trim()) {
          continue;
        }

        candidatesWithText.push({ candidate, cvText });
      }

      return candidatesWithText;
    },

    async getJobDescriptionText(
      jobDescriptionInput: JobDescriptionInput,
    ): Promise<string> {
      if (jobDescriptionInput.mode === "text") {
        return jobDescriptionInput.text;
      }

      const parsedText = await parsePdf(jobDescriptionInput.file);
      if (!parsedText.trim()) {
        throw new Error(
          "Kunne ikke lese tekst fra opplastet stillingsbeskrivelse.",
        );
      }

      return parsedText;
    },

    async createJobProfile(
      _jobDescriptionInput: JobDescriptionInput,
      jobDescriptionText: string,
    ): Promise<JobProfile> {
      const prompt = buildJobProfileFromTextPrompt(jobDescriptionText);
      const responseText = await callNorLlm(prompt);

      return parseNorLlmJsonWithRepair({
        rawText: responseText,
        schemaDescription: `{
  "role_title": string,
  "must_haves": string[],
  "nice_to_haves": string[],
}`,
        parse: parseJobProfile,
      });
    },

    async evaluateCandidates(params: {
      candidatesWithCv: CandidateWithCvText[];
      jobProfile: JobProfile;
    }): Promise<CandidateEval[]> {
      const { candidatesWithCv, jobProfile } = params;
      const prompt = buildCandidatesEvaluationPrompt({
        jobProfile,
        candidates: candidatesWithCv.map((item) => ({
          candidateId: String(item.candidate.id),
          candidateLabel: item.candidate.name ?? `candidate-${item.candidate.id}`,
          cvText: item.cvText,
        })),
      });

      const responseText = await callNorLlm(prompt);

      return parseNorLlmJsonWithRepair({
        rawText: responseText,
        schemaDescription: `{
  "evaluations": [{
    "candidate_id": string,
    "candidate_label": string,
    "candidate_role": string,
    "qualified": boolean,
    "overall_score": number,
    "experience_highlights": string[],
    "education": string[],
    "strengths": [{"point": string, "explanation": string}],
    "gaps": [{"point": string, "explanation": string, "impact": "high"|"medium"|"low"}],
    "unknowns": string[]
  }]
}`,
        parse: parseCandidateEvals,
      });
    },

  };
}
