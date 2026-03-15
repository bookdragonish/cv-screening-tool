// services/llm/providers/norllm/norllm.provider.ts
import { parsePdf } from "../../../middleware/parserPDF.js";
import { pool } from "../../../db/pool.js";
import {
  buildCandidateEvalPrompt,
  buildJobProfileFromTextPrompt,
  buildRankingPrompt,
} from "../gemini/prompts/prompts.js";
import {
  parseJobProfile,
  parseRanking,
} from "../gemini/schemas.js";

import type {
  ApiCandidate,
  CandidateEval,
  CandidateWithCvText,
  JobDescriptionInput,
  JobProfile,
} from "../../../types/ai.types.js";
import { callNorLlm, parseNorLlmJsonWithRepair } from "./norllm.client.js";
import {
  fixRanking,
  buildFallbackRankingFromEvals,
  fixCandidateEval,
} from "./norllm.parser.js";

const NORLLM_URL = "https://llm.hpc.ntnu.no/v1/chat/completions";
const NORLLM_MODEL = "NorwAI/NorwAI-Magistral-24B-reasoning";

// This is called by the service and runs each request on norllm

type RankingResult = ReturnType<typeof parseRanking>;

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
  "nice_to_haves": string[]
}`,
        parse: parseJobProfile,
      });
    },

    async evaluateCandidates(params: {
      candidatesWithCv: CandidateWithCvText[];
      jobProfile: JobProfile;
    }): Promise<CandidateEval[]> {
      const { candidatesWithCv, jobProfile } = params;
      const evals: CandidateEval[] = [];

      for (const item of candidatesWithCv) {
        const candidate = item.candidate;

        const prompt = `${buildCandidateEvalPrompt({
          jobProfile,
          candidateId: String(candidate.id),
          candidateLabel: candidate.name ?? `candidate-${candidate.id}`,
        })}

<candidate_cv_text>
${item.cvText}
</candidate_cv_text>`;

        const responseText = await callNorLlm(prompt);

        const parsedEval = await parseNorLlmJsonWithRepair({
          rawText: responseText,
          schemaDescription: `{
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
}`,
          parse: (text) =>
            fixCandidateEval({
              text,
              fallbackCandidateId: String(candidate.id),
              fallbackCandidateLabel:
                candidate.name ?? `candidate-${candidate.id}`,
            }),
        });

        evals.push(parsedEval);
      }

      return evals;
    },

    async rankCandidates(params: {
      jobProfile: JobProfile;
      evals: CandidateEval[];
      candidatesWithCv: CandidateWithCvText[];
    }): Promise<RankingResult> {
      const { jobProfile, evals, candidatesWithCv } = params;

      const rankingPrompt = buildRankingPrompt({ jobProfile, evals });
      const rankingText = await callNorLlm(rankingPrompt);

      const ranking = await parseNorLlmJsonWithRepair({
        rawText: rankingText,
        schemaDescription: `{
  "role_title": string,
  "ranking": [{
    "rank": number,
    "candidate_id": string,
    "candidate_label": string,
    "overall_score": number,
    "qualified": boolean,
    "summary": string
  }]
}`,
        parse: fixRanking,
      });

      return ranking.ranking.length > 0
        ? ranking
        : buildFallbackRankingFromEvals({
            jobProfile,
            evals,
            candidatesWithCv,
          });
    },
  };
}
