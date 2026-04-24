import type {
  EvalCandidate,
  CandidateWithCvText,
  JobDescriptionInput,
  EvalJobPost,
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
  ): Promise<EvalJobPost>;

  evaluateCandidates(params: {
    candidatesWithCv: CandidateWithCvText[];
    jobProfile: EvalJobPost;
  }): Promise<EvalCandidate[]>
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
  ): Promise<EvalJobPost>;

  evaluateCandidates(params: {
    candidatesWithCv: CandidateWithCvText[];
    jobProfile: EvalJobPost;
  }): Promise<EvalCandidate[]>;
};

export type ScreeningLlmProvider =
  | GeminiProvider
  | NorllmProvider;
