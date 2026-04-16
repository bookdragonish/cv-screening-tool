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
import { callNorLlm, parseNorLlmJsonWithRepair } from "../norLLM/norllm.client.js";

export function createNorllmProvider() {
  return {
    kind: "norllm" as const,

    async loadCandidates(limit: number): Promise<CandidateWithCvText[]> {
      const result = await pool.query(
        "select id, name, email, cv_markdown from candidates where cv_markdown is not null and btrim(cv_markdown) <> '' order by id desc limit $1",
        [limit],
      );

      const rows = result.rows as ApiCandidate[];
      const candidatesWithText: CandidateWithCvText[] = [];

      for (const candidate of rows) {
        const cvText = candidate.cv_markdown?.trim() ?? "";
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
      if (candidatesWithCv.length === 0) {
        return [];
      }

      const prompt = buildCandidatesEvaluationPrompt({
        jobProfile,
        candidates: candidatesWithCv.map((item) => {
          const candidate = item.candidate;
          return {
            candidateId: String(candidate.id),
            candidateLabel: candidate.name ?? `candidate-${candidate.id}`,
            cvText: item.cvText,
          };
        }),
      });

      const responseText = await callNorLlm(prompt);

      return parseNorLlmJsonWithRepair({
        rawText: responseText,
        schemaDescription: `{
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
}`,
        parse: parseCandidateEvals,
      });
    },

  };
}
