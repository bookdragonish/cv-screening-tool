import type {
  CandidateEval,
  CandidateWithCv,
  CandidateWithCvText,
  JobDescriptionInput,
  JobProfile,
} from "../types/GeminiTypes.js";
import { parseRanking } from "../services/llm/gemini/schemas.js";

// Interface for the providers to ensure they cotains similar functions

export type GeminiProvider = {
  kind: "gemini";

  loadCandidates(limit: number): Promise<CandidateWithCv[]>;

  getJobDescriptionText(
    input: JobDescriptionInput,
  ): Promise<string>;

  createJobProfile(
    input: JobDescriptionInput,
    jobDescriptionText: string,
  ): Promise<JobProfile>;

  evaluateCandidates(params: {
    candidatesWithCv: CandidateWithCv[];
    jobProfile: JobProfile;
  }): Promise<CandidateEval[]>;

  rankCandidates(params: {
    jobProfile: JobProfile;
    evals: CandidateEval[];
    candidatesWithCv: CandidateWithCv[];
  }): Promise<ReturnType<typeof parseRanking>>;
};

export type NorllmProvider = {
  kind: "norllm";

  loadCandidates(limit: number): Promise<CandidateWithCvText[]>;

  getJobDescriptionText(
    input: JobDescriptionInput,
  ): Promise<string>;

  createJobProfile(
    input: JobDescriptionInput,
    jobDescriptionText: string,
  ): Promise<JobProfile>;

  evaluateCandidates(params: {
    candidatesWithCv: CandidateWithCvText[];
    jobProfile: JobProfile;
  }): Promise<CandidateEval[]>;

  rankCandidates(params: {
    jobProfile: JobProfile;
    evals: CandidateEval[];
    candidatesWithCv: CandidateWithCvText[];
  }): Promise<ReturnType<typeof parseRanking>>;
};

export type ScreeningLlmProvider =
  | GeminiProvider
  | NorllmProvider;