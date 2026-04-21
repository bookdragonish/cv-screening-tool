import { getLlmProvider } from "../llm/llm.service.js";
import {
  buildRankingFromEvaluations,
  buildRequiredSkills,
  buildScreeningRecord,
  mapToScreeningCandidates,
} from "./screening.mappers.js";
import type {
  JobDescriptionInput,
  RunScreeningResponse,
} from "../../types/ai.types.js";

type Params = {
  jobDescriptionInput: JobDescriptionInput;
  candidateLimit: number;
};

/**
 * Gets the llm provider and makes the neccessary AI calls to this one. 
 * 
 * TODO: this can be simplified, there is duplicated code as:
 * The only difference is the type of candidatesWithCv: Gemini → CandidateWithCv[], NorLLM → CandidateWithCvText[]
 * 
 * @param param0 
 * @returns Promise of response
 */
export async function runScreeningService({
  jobDescriptionInput,
  candidateLimit,
}: Params): Promise<RunScreeningResponse> {
  const provider = await getLlmProvider();

  if (provider.kind === "gemini") {
    const candidatesWithCv = await provider.loadCandidates(candidateLimit);

    if (!candidatesWithCv.length) {
      throw new Error("Fant ingen kandidater med tilgjengelig CV i databasen.");
    }

    const jobDescriptionText = await provider.getJobDescriptionText(
      jobDescriptionInput,
    );

    const jobProfile = await provider.createJobProfile(
      jobDescriptionInput,
      jobDescriptionText,
    );

    const evals = await provider.evaluateCandidates({
      candidatesWithCv,
      jobProfile,
    });

    const ranking = buildRankingFromEvaluations({
      jobProfile,
      evals,
      candidatesWithCv,
    });

    const candidates = mapToScreeningCandidates({
      jobProfile,
      ranking,
      evals,
      candidatesWithCv,
    });

    if (!candidates.length) {
      throw new Error(
        "Fant ingen kandidater som kunne matches mot screeningresultatet.",
      );
    }

    if (candidates.length < candidatesWithCv.length) {
      throw new Error(
        `Screening feilet: For få kandidater i output (${candidates.length}/${candidatesWithCv.length}).`,
      );
    }

    const screeningRecord = buildScreeningRecord({
      jobDescriptionInput,
      jobDescriptionText,
      jobProfile,
      ranking,
      evals,
      candidatesWithCv,
    });

    return {
      screeningRecord,
      requiredSkills: buildRequiredSkills(jobProfile),
      candidates,
    };
  }

  const candidatesWithCv = await provider.loadCandidates(candidateLimit);

  if (!candidatesWithCv.length) {
    throw new Error("Fant ingen kandidater med tilgjengelig CV i databasen.");
  }

  const jobDescriptionText = await provider.getJobDescriptionText(
    jobDescriptionInput,
  );

  const jobProfile = await provider.createJobProfile(
    jobDescriptionInput,
    jobDescriptionText,
  );

  const evals = await provider.evaluateCandidates({
    candidatesWithCv,
    jobProfile,
  });

  const ranking = buildRankingFromEvaluations({
    jobProfile,
    evals,
    candidatesWithCv,
  });

  const candidates = mapToScreeningCandidates({
    jobProfile,
    ranking,
    evals,
    candidatesWithCv,
  });

  if (!candidates.length) {
    throw new Error(
      "Fant ingen kandidater som kunne matches mot screeningresultatet.",
    );
  }

  if (candidates.length < candidatesWithCv.length) {
    throw new Error(
      `Screening feilet: For få kandidater i output (${candidates.length}/${candidatesWithCv.length}).`,
    );
  }

  const screeningRecord = buildScreeningRecord({
    jobDescriptionInput,
    jobDescriptionText,
    jobProfile,
    ranking,
    evals,
    candidatesWithCv,
  });

  return {
    screeningRecord,
    requiredSkills: buildRequiredSkills(jobProfile),
    candidates,
  };
}