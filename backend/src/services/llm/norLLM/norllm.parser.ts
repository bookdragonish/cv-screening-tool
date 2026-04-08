import { parseCandidateEval, parseRanking } from "../gemini/schemas.js";
import type {
  CandidateEval,
  CandidateWithCvText,
  JobProfile,
} from "../../../types/ai.types.js";
import {
  normalizeString,
  normalizeStringList as toNonEmptyStringArray,
} from "../../../utils/normailizers.js";

// These parsers ensueres that norllm gets information in a reable way after its collected from the database

// Avoid code insertions
function stripCodeFences(s: string): string {
  return s
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
}

function extractJsonObjectCandidates(text: string): string[] {
  const s = stripCodeFences(text);
  const candidates: string[] = [];

  for (
    let start = s.indexOf("{");
    start !== -1;
    start = s.indexOf("{", start + 1)
  ) {
    let depth = 0;

    for (let i = start; i < s.length; i += 1) {
      if (s[i] === "{") depth += 1;
      else if (s[i] === "}") depth -= 1;

      if (depth === 0) {
        candidates.push(s.slice(start, i + 1));
        break;
      }
    }
  }

  return candidates;
}

function parseFirstJsonObject(text: string): unknown {
  const candidates = extractJsonObjectCandidates(text);

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      // continue
    }
  }

  throw new Error("Could not parse any JSON object from response.");
}

function pickLikelyJsonRoot(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object") return {};

  const record = value as Record<string, unknown>;

  if (record.JSON && typeof record.JSON === "object") {
    return record.JSON as Record<string, unknown>;
  }

  if (record.json && typeof record.json === "object") {
    return record.json as Record<string, unknown>;
  }

  return record;
}

function normalizeImpact(value: unknown): "high" | "medium" | "low" {
  const s = typeof value === "string" ? value.trim().toLowerCase() : "";

  if (s === "high" || s === "hoy" || s === "høy") return "high";
  if (s === "low" || s === "lav") return "low";

  return "medium";
}

function toScore(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function fixCandidateEval(params: {
  text: string;
  fallbackCandidateId: string;
  fallbackCandidateLabel: string;
}): CandidateEval {
  const { text, fallbackCandidateId, fallbackCandidateLabel } = params;

  try {
    return parseCandidateEval(text);
  } catch {
    let raw: Record<string, unknown> = {};

    try {
      raw = pickLikelyJsonRoot(parseFirstJsonObject(text));
    } catch {
      // continue with empty object
    }

    const score = toScore(raw.overall_score);
    const strengthsRaw = Array.isArray(raw.strengths) ? raw.strengths : [];
    const gapsRaw = Array.isArray(raw.gaps) ? raw.gaps : [];

    const strengths = strengthsRaw
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const record = item as Record<string, unknown>;

        const point = normalizeString(
          typeof record.point === "string" ? record.point : "",
        );
        const explanation = normalizeString(
          typeof record.explanation === "string" ? record.explanation : "",
        );

        if (!point && !explanation) return null;

        return {
          point: point || "Uspesifisert styrke",
          explanation: explanation || "Ikke oppgitt",
        };
      })
      .filter(
        (item): item is { point: string; explanation: string } => item !== null,
      );

    const gaps = gapsRaw
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const record = item as Record<string, unknown>;

        const point = normalizeString(
          typeof record.point === "string" ? record.point : "",
        );
        const explanation = normalizeString(
          typeof record.explanation === "string" ? record.explanation : "",
        );

        if (!point && !explanation) return null;

        return {
          point: point || "Uspesifisert gap",
          explanation: explanation || "Ikke oppgitt",
          impact: normalizeImpact(record.impact),
        };
      })
      .filter(
        (
          item,
        ): item is {
          point: string;
          explanation: string;
          impact: "high" | "medium" | "low";
        } => item !== null,
      );

    return {
      candidate_id:
        normalizeString(
          typeof raw.candidate_id === "string" ? raw.candidate_id : "",
        ) || fallbackCandidateId,
      candidate_label:
        normalizeString(
          typeof raw.candidate_label === "string" ? raw.candidate_label : "",
        ) || fallbackCandidateLabel,
      candidate_role:
        normalizeString(
          typeof raw.candidate_role === "string" ? raw.candidate_role : "",
        ) || "Kandidat",
      qualified:
        typeof raw.qualified === "boolean" ? raw.qualified : score >= 50,
      overall_score: score,
      experience_highlights: toNonEmptyStringArray(raw.experience_highlights),
      education: toNonEmptyStringArray(raw.education),
      strengths: strengths.length
        ? strengths
        : [{ point: "Ingen tydelige styrker", explanation: "Ikke oppgitt" }],
      gaps,
      unknowns: toNonEmptyStringArray(raw.unknowns),
    };
  }
}

export function fixRanking(text: string): ReturnType<typeof parseRanking> {
  try {
    return parseRanking(text);
  } catch {
    let raw: Record<string, unknown> = {};

    try {
      raw = pickLikelyJsonRoot(parseFirstJsonObject(text));
    } catch {
      // continue with empty object
    }

    const roleTitle =
      normalizeString(
        typeof raw.role_title === "string" ? raw.role_title : "",
      ) || "Screening";

    const rankingRaw = Array.isArray(raw.ranking) ? raw.ranking : [];

    const normalizedRanking = rankingRaw
      .map((item, index) => {
        if (!item || typeof item !== "object") return null;

        const record = item as Record<string, unknown>;
        const candidateId = normalizeString(
          typeof record.candidate_id === "string" ? record.candidate_id : "",
        );

        if (!candidateId) return null;

        return {
          rank:
            Number.isFinite(Number(record.rank)) && Number(record.rank) > 0
              ? Math.floor(Number(record.rank))
              : index + 1,
          candidate_id: candidateId,
          candidate_label:
            normalizeString(
              typeof record.candidate_label === "string"
                ? record.candidate_label
                : "",
            ) || `Kandidat ${candidateId}`,
          overall_score: toScore(record.overall_score),
          qualified:
            typeof record.qualified === "boolean"
              ? record.qualified
              : toScore(record.overall_score) >= 50,
          summary:
            normalizeString(
              typeof record.summary === "string" ? record.summary : "",
            ) || "Ingen oppsummering tilgjengelig.",
        };
      })
      .filter(
        (
          item,
        ): item is {
          rank: number;
          candidate_id: string;
          candidate_label: string;
          overall_score: number;
          qualified: boolean;
          summary: string;
        } => item !== null,
      );

    return parseRanking(
      JSON.stringify({
        role_title: roleTitle,
        ranking: normalizedRanking,
      }),
    );
  }
}

export function buildFallbackRankingFromEvals(params: {
  jobProfile: JobProfile;
  evals: CandidateEval[];
  candidatesWithCv: CandidateWithCvText[];
}): ReturnType<typeof parseRanking> {
  const { jobProfile, evals, candidatesWithCv } = params;

  const candidateById = new Map(
    candidatesWithCv.map((item) => [String(item.candidate.id), item.candidate]),
  );

  const ranking = evals
    .map((evaluation) => {
      const candidate = candidateById.get(evaluation.candidate_id);
      if (!candidate) return null;

      const score = toScore(evaluation.overall_score);

      return {
        candidate_id: String(candidate.id),
        candidate_label:
          normalizeString(evaluation.candidate_label) ||
          normalizeString(candidate.name) ||
          `Kandidat ${candidate.id}`,
        overall_score: score,
        qualified:
          typeof evaluation.qualified === "boolean"
            ? evaluation.qualified
            : score >= 50,
        summary:
          normalizeString(evaluation.strengths?.[0]?.point) ||
          normalizeString(evaluation.candidate_role) ||
          "Ingen oppsummering tilgjengelig.",
      };
    })
    .filter(
      (
        item,
      ): item is {
        candidate_id: string;
        candidate_label: string;
        overall_score: number;
        qualified: boolean;
        summary: string;
      } => item !== null,
    )
    .sort((a, b) => b.overall_score - a.overall_score)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

  return {
    role_title: normalizeString(jobProfile.role_title) || "Screening",
    ranking,
  };
}
