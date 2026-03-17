import { parseRanking } from "../llm/gemini/schemas.js";
import type {
  CandidateEval,
  CandidateWithCv,
  CandidateWithCvText,
  JobDescriptionInput,
  JobProfile,
  SaveScreeningRunPayload,
  ScreeningCandidate,
} from "../../types/ai.types.js";
import {
  getFallbackJobTitle,
} from "./screening.helpers.js";
import { normalizeString, normalizeStringList } from "../../utils/normailizers.js";

// These mappers takes output from AI and creates the objects in the format we want.

type RankingResult = ReturnType<typeof parseRanking>;
type CandidateSource = CandidateWithCv | CandidateWithCvText;

// Looks at jobs and maps musthaves to nice to haves
export function buildRequiredSkills(jobProfile: JobProfile): string[] {
  return Array.from(
    new Set(
      [...jobProfile.must_haves]
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

// Creates the candidate output after AI ranking
export function mapToScreeningCandidates(params: {
  ranking: RankingResult;
  evals: CandidateEval[];
  candidatesWithCv: CandidateSource[];
}): ScreeningCandidate[] {
  const { ranking, evals, candidatesWithCv } = params;

  const dbCandidatesById = new Map(
    candidatesWithCv.map((item) => [String(item.candidate.id), item.candidate]),
  );

  const evalByCandidateId = new Map(
    evals.map((item) => [item.candidate_id, item]),
  );

  return ranking.ranking
    .map((rankedItem, index) => {
      const dbCandidate = dbCandidatesById.get(rankedItem.candidate_id);
      if (!dbCandidate) {
        return null;
      }

      const evalResult = evalByCandidateId.get(rankedItem.candidate_id);

      const met =
        evalResult?.strengths.map((item) => item.point).filter(Boolean) ?? [];

      const missing =
        evalResult?.gaps.map((item) => item.point).filter(Boolean) ?? [];

      const experience =
        evalResult?.strengths.map((item) => item.evidence).filter(Boolean) ?? [];

      const unknowns = evalResult?.unknowns.filter(Boolean) ?? [];

      const normalizedScore = Math.max(
        0,
        Math.min(100, Math.round(rankedItem.overall_score)),
      );

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
            : ["Ikke oppgitt"],
        education: evalResult?.education?.length
          ? evalResult.education.slice(0, 3)
          : unknowns.length
            ? unknowns.slice(0, 3)
            : ["Ikke oppgitt"],
        email: dbCandidate.email ?? "Ikke oppgitt",
        phone: evalResult?.contact_phone?.trim() || "Ikke oppgitt",
      };
    })
    .filter((item): item is ScreeningCandidate => item !== null)
    .sort((a, b) => a.rank - b.rank);
}

// Builds the entire screening object after screening.
export function buildScreeningRecord(params: {
  jobDescriptionInput: JobDescriptionInput;
  jobDescriptionText: string;
  jobProfile: JobProfile;
  ranking: RankingResult;
  evals: CandidateEval[];
  candidatesWithCv: CandidateSource[];
}): SaveScreeningRunPayload {
  const {
    jobDescriptionInput,
    jobDescriptionText,
    jobProfile,
    ranking,
    evals,
    candidatesWithCv,
  } = params;

  const dbCandidatesById = new Map(
    candidatesWithCv.map((item) => [String(item.candidate.id), item.candidate]),
  );

  const evalByCandidateId = new Map(
    evals.map((item) => [item.candidate_id, item]),
  );

  const title =
    normalizeString(jobProfile.role_title) ||
    getFallbackJobTitle(jobDescriptionInput);

  const hardQualifications = normalizeStringList(jobProfile.must_haves);

  const candidates: SaveScreeningRunPayload["candidates"] = [];

  for (const [index, rankedItem] of ranking.ranking.entries()) {
    const dbCandidate = dbCandidatesById.get(rankedItem.candidate_id);
    if (!dbCandidate) {
      continue;
    }

    const evalResult = evalByCandidateId.get(rankedItem.candidate_id);

    const met = normalizeStringList(
      evalResult?.strengths.map((item) => item.point),
    );

    const missing = normalizeStringList(
      evalResult?.gaps.map((item) => item.point),
    );

    const normalizedScore = Math.max(
      0,
      Math.min(100, Math.round(rankedItem.overall_score)),
    );

    candidates.push({
      candidateId: dbCandidate.id,
      rank: rankedItem.rank ?? index + 1,
      score: normalizedScore,
      qualified: rankedItem.qualified,
      qualificationsMet: met.length
        ? met
        : ["Ingen tydelige kvalifikasjonstreff funnet."],
      qualificationsMissing: missing,
      summary:
        normalizeString(rankedItem.summary) ||
        "Ingen oppsummering tilgjengelig.",
    });
  }

  candidates.sort((a, b) => a.rank - b.rank);

  return {
    title,
    header: title,
    description:
      jobDescriptionInput.mode === "text"
        ? normalizeString(jobDescriptionText) ||
          `Stillingsbeskrivelse for ${title}`
        : `Analysert fra opplastet PDF: ${jobDescriptionInput.originalName}`,
    hardQualifications,
    candidates,
  };
}