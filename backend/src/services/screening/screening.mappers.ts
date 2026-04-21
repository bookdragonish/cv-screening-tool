import type {
  CandidateEval,
  CandidateWithCvText,
  JobDescriptionInput,
  JobProfile,
  Ranking,
  SaveScreeningRunPayload,
  ScreeningCandidate,
} from "../../types/ai.types.js";
import {
  getFallbackJobTitle,
} from "./screening.helpers.js";
import { normalizeString, normalizeStringList } from "../../utils/normailizers.js";

function normalizeRecommendationPoints(
  recommendations: CandidateEval["courseRecommendations"] | undefined,
): string[] {
  if (!Array.isArray(recommendations)) {
    return [];
  }
  return normalizeStringList(recommendations.map((item) => item?.point));
}

// These mappers takes output from AI and creates the objects in the format we want.

export function buildRankingFromEvaluations(params: {
  jobProfile: JobProfile;
  evals: CandidateEval[];
  candidatesWithCv: CandidateWithCvText[];
}): Ranking {
  const { jobProfile, evals, candidatesWithCv } = params;

  const candidateIdSet = new Set(
    candidatesWithCv.map((item) => String(item.candidate.id)),
  );

  const rankedCandidates = evals
    .filter((evaluation) => candidateIdSet.has(evaluation.candidate_id))
    .map((evaluation) => {
      const score = Math.round(evaluation.overall_score);

      return {
        candidate_id: evaluation.candidate_id,
        candidate_label: normalizeString(evaluation.candidate_name),
        overall_score: score,
        qualified: evaluation.qualified,
        summary:
          normalizeString(evaluation.summary) ||
          "Ingen oppsummering gitt av modellen.",
      };
    })
    .sort((a, b) => {
      const scoreDiff = b.overall_score - a.overall_score;
      if (scoreDiff !== 0) {
        return scoreDiff;
      }

      if (a.qualified === b.qualified) {
        return 0;
      }

      return a.qualified ? -1 : 1;
    });

  const ranking: Ranking["ranking"] = [];

  for (const [index, item] of rankedCandidates.entries()) {
    const previousCandidate = rankedCandidates[index - 1];
    const hasSameRankAsPrevious =
      previousCandidate !== undefined
      && previousCandidate.overall_score === item.overall_score
      && previousCandidate.qualified === item.qualified;

    const rank = hasSameRankAsPrevious
      ? ranking[index - 1]?.rank ?? index + 1
      : index + 1;

    ranking.push({
      rank,
      ...item,
    });
  }

  return {
    role_title: normalizeString(jobProfile.role_title) || "Screening",
    ranking,
  };
}

function RawQualificationsToUsableQualifications(args: {
  requirements: string[];
  metRaw: string[] | undefined;
  missingRaw: string[] | undefined;
  unknownRaw: string[] | undefined;
  courseRaw: string[] | undefined;
}): { met: string[]; missing: string[]; unknowns: string[]; courses: string[]; } {
  const requirements = normalizeStringList(args.requirements);
  const requirementSet = new Set(requirements.map((item) => item.toLowerCase()));

  const metSet = new Set(
    normalizeStringList(args.metRaw)
      .filter((item) => requirementSet.has(item.toLowerCase()))
      .map((item) => item.toLowerCase()),
  );

  const unknownSet = new Set(
    normalizeStringList(args.unknownRaw)
      .filter((item) => requirementSet.has(item.toLowerCase()))
      .map((item) => item.toLowerCase()),
  );

  const missingSet = new Set(
    normalizeStringList(args.missingRaw)
      .filter((item) => requirementSet.has(item.toLowerCase()))
      .map((item) => item.toLowerCase()),
  );

  const courseSet = new Set(
    normalizeStringList(args.courseRaw)
      .filter((item) => requirementSet.has(item.toLowerCase()))
      .map((item) => item.toLowerCase()),
  );

  const met: string[] = [];
  const unknowns: string[] = [];
  const missing: string[] = [];
  const courses: string[] = [];

  for (const requirement of requirements) {
    const key = requirement.toLowerCase();

    if (metSet.has(key)) {
      met.push(requirement);
      continue;
    }

    if (unknownSet.has(key)) {
      unknowns.push(requirement);
      continue;
    }

    if (missingSet.has(key)) {
      missing.push(requirement);
      continue;
    }

    if (courseSet.has(key)) {
      courses.push(requirement);
      continue;
    }

    else {
      unknowns.push(requirement);
    }
  }

  return { met, missing, unknowns, courses };
}

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
  jobProfile: JobProfile;
  ranking: Ranking;
  evals: CandidateEval[];
  candidatesWithCv: CandidateWithCvText[];
}): ScreeningCandidate[] {
  const { jobProfile, ranking, evals, candidatesWithCv } = params;

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

      const qualificationResult = RawQualificationsToUsableQualifications({
        requirements: [...(jobProfile.must_haves ?? []), ...(jobProfile.must_haves_can_be_coursed ?? []), ...(jobProfile.nice_to_haves ?? []),],
        metRaw: evalResult?.strengths.map((item) => item.point),
        missingRaw: evalResult?.gaps.map((item) => item.point),
        unknownRaw: evalResult?.unknowns.map((item) => item.point),
        courseRaw: normalizeRecommendationPoints(evalResult?.courseRecommendations),
      });

      const experience =
        evalResult?.strengths.map((item) => item.explanation).filter(Boolean) ?? [];

      const normalizedScore = Math.round(rankedItem.overall_score);

      return {
        id: dbCandidate.id,
        rank: rankedItem.rank ?? index + 1,
        name: dbCandidate.name?.trim() || "Navn ikke funnet",
        score: normalizedScore,
        met: qualificationResult.met,
        missing: qualificationResult.missing,
        courseRecommendations: qualificationResult.courses,
        summary: rankedItem.summary || "Ingen oppsummering gitt av modellen.",

        email: dbCandidate.email ?? "",
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
  ranking: Ranking;
  evals: CandidateEval[];
  candidatesWithCv: CandidateWithCvText[];
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

  const hardQualifications = normalizeStringList((jobProfile.must_haves ?? []).concat(jobProfile.must_haves_can_be_coursed ?? []));
  const softQualifications = normalizeStringList(jobProfile.nice_to_haves);

  const candidates: SaveScreeningRunPayload["candidates"] = [];

  for (const [index, rankedItem] of ranking.ranking.entries()) {
    const dbCandidate = dbCandidatesById.get(rankedItem.candidate_id);
    if (!dbCandidate) {
      continue;
    }

    const evalResult = evalByCandidateId.get(rankedItem.candidate_id);

    const qualificationResult = RawQualificationsToUsableQualifications({
      requirements: [...(jobProfile.must_haves ?? []), ...(jobProfile.must_haves_can_be_coursed ?? []), ...(jobProfile.nice_to_haves ?? [])],
      metRaw: evalResult?.strengths.map((item) => item.point),
      missingRaw: evalResult?.gaps.map((item) => item.point),
      unknownRaw: evalResult?.unknowns.map((item) => item.point),
      courseRaw: normalizeRecommendationPoints(evalResult?.courseRecommendations),
    });

    const normalizedScore = Math.round(rankedItem.overall_score);

    candidates.push({
      candidateId: dbCandidate.id,
      rank: rankedItem.rank ?? index + 1,
      score: normalizedScore,
      qualified: rankedItem.qualified,
      qualificationsMet: qualificationResult.met,
      qualificationsMissing: qualificationResult.missing,
      courseRecommendations: qualificationResult.courses,
      unknowns: qualificationResult.unknowns,
      summary: normalizeString(rankedItem.summary) || "Ingen oppsummering gitt av modellen.",
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
    softQualifications,
    candidates,
  };
}