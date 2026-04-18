import { z } from "zod";
import type { CandidateEval, JobProfile, Ranking } from "../../../types/ai.types.js";

/**
 * Normalizes impact labels before validating allowed values.
 */
const ImpactSchema = z.preprocess(
  (val) => (typeof val === "string" ? val.trim().toLowerCase() : val),
  z.enum(["high", "medium", "low"])
);

/**
 * Expected JSON shape for the extracted job profile.
 */
export const JobProfileSchema = z.object({
  role_title: z.string(),
  must_haves: z.array(z.string()),
  must_haves_can_be_coursed: z.array(z.string()).optional(),
  nice_to_haves: z.array(z.string()).optional(),
});

/**
 * Expected JSON shape for one candidate evaluation.
 */
export const CandidateEvalSchema = z.object({
  candidate_id: z.string(),
  candidate_name: z.string(),
  summary: z.string(),
  qualified: z.boolean(),
  overall_score: z.number(),
  strengths: z.array(z.object({ point: z.string(), explanation: z.string() })),
  gaps: z.array(z.object({ point: z.string(), explanation: z.string() })),
  unknowns: z.array(z.object({ point: z.string(), explanation: z.string() })),
  courseRecommendations: z.array(z.object({ point: z.string(), explanation: z.string() })),
});

export const CandidateEvalsSchema = z.object({
  evaluations: z.array(CandidateEvalSchema),
});

/**
 * Expected JSON shape for final ranking output.
 */
export const RankingSchema = z.object({
  role_title: z.string(),
  ranking: z.array(
    z.object({
      rank: z.number(),
      candidate_id: z.string(),
      candidate_label: z.string(),
      overall_score: z.number(),
      qualified: z.boolean(),
      summary: z.string(),
    })
  ),
});

/**
 * Removes surrounding markdown code fences from model output.
 */
function stripCodeFences(s: string): string {
  return s.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
}

/**
 * Extracts the first JSON object from a text response.
 */
function extractFirstJsonObject(text: string): string {
  const s = stripCodeFences(text);
  const start = s.indexOf("{");
  if (start === -1) throw new Error("No JSON object start '{' found.");

  let depth = 0;
  let inString = false;
  let isEscaped = false;

  for (let i = start; i < s.length; i++) {
    const ch = s[i];

    if (inString) {
      if (isEscaped) {
        isEscaped = false;
        continue;
      }

      if (ch === "\\") {
        isEscaped = true;
        continue;
      }

      if (ch === "\"") {
        inString = false;
      }

      continue;
    }

    if (ch === "\"") {
      inString = true;
      continue;
    }

    if (ch === "{") {
      depth++;
      continue;
    }

    if (ch === "}") {
      depth--;
      if (depth === 0) return s.slice(start, i + 1);
    }
  }

  throw new Error("JSON object not closed properly.");
}

/**
 * Parses a JSON object from model output text.
 */
function parseJsonOrThrow(text: string): unknown {
  const stripped = stripCodeFences(text);

  try {
    return JSON.parse(stripped);
  } catch {
    const jsonStr = extractFirstJsonObject(stripped);
    return JSON.parse(jsonStr);
  }
}

/**
 * Parses and validates job profile output from the LLM.
 */
export function parseJobProfile(text: string): JobProfile {
  return JobProfileSchema.parse(parseJsonOrThrow(text)) as JobProfile;
}

/**
 * Parses and validates candidate evaluation output from the LLM.
 */
export function parseCandidateEval(text: string): CandidateEval {
  return CandidateEvalSchema.parse(parseJsonOrThrow(text)) as CandidateEval;
}

/**
 * Parses the candidate evaluations from the LLM.
 */
export function parseCandidateEvals(text: string): CandidateEval[] {
  const parsed = CandidateEvalsSchema.parse(parseJsonOrThrow(text)) as {
    evaluations: CandidateEval[];
  };
  return parsed.evaluations;
}

/**
 * Parses and validates candidate ranking output from the LLM.
 */
export function parseRanking(text: string): Ranking {
  return RankingSchema.parse(parseJsonOrThrow(text)) as Ranking;
}
