import type {
  CandidateEval,
  CandidateWithCvText,
  JobDescriptionInput,
  JobProfile,
} from "./ai.types.js";

// Interface for the providers to ensure they cotains similar functions

export type GeminiProvider = {
  kind: "gemini";

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
};

export type ScreeningLlmProvider =
  | GeminiProvider
  | NorllmProvider;
