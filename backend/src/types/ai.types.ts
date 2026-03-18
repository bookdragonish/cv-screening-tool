export type JobProfile = {
  role_title: string;
  must_haves: string[];
  nice_to_haves?: string[];
};

export type CandidateEval = {
  candidate_id: string;
  candidate_label: string;
  candidate_role?: string;
  qualified: boolean;
  overall_score: number;
  experience_highlights?: string[];
  education?: string[];
  strengths: Array<{ point: string; explanation: string }>;
  gaps: Array<{ point: string; explanation: string; impact: "high" | "medium" | "low" }>;
  unknowns: string[];
};

export type Ranking = {
  role_title: string;
  ranking: Array<{
    rank: number;
    candidate_id: string;
    candidate_label: string;
    overall_score: number;
    qualified: boolean;
    summary: string;
  }>;
};

export type ApiCandidate = {
  id: number;
  name?: string | null;
  email?: string | null;
  created_at?: string;
  cv_pdf: Buffer;
};

export type CandidateWithCvText = {
  candidate: ApiCandidate;
  cvText: string;
};

export type ScreeningCandidate = {
  id: number;
  rank: number;
  name: string;
  role: string;
  score: number;
  met: string[];
  missing: string[];
  summary: string;
  experience: string[];
  education: string[];
  email: string;
  phone: string;
};

export type SaveScreeningRunPayload = {
  title: string;
  header: string;
  description: string;
  hardQualifications: string[];
  softQualifications: string[];
  candidates: Array<{
    candidateId: number;
    rank: number;
    score: number;
    qualified: boolean;
    qualificationsMet: string[];
    qualificationsMissing: string[];
    unknowns: string[];
    summary?: string;
  }>;
};

export type RunScreeningResponse = {
  screeningRecord: SaveScreeningRunPayload;
  requiredSkills: string[];
  candidates: ScreeningCandidate[];
};

export type JobDescriptionInput =
  | { mode: "text"; text: string }
  | { mode: "pdf"; file: Buffer; originalName: string };

export type NorLlmResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};
