export type EvalJobPost = {
  role_title: string;
  must_haves: string[];
  must_haves_can_be_coursed?: string[];
  nice_to_haves?: string[];
};

export type EvalCandidate = {
  candidate_id: string;
  candidate_name: string;
  summary: string;
  qualified: boolean;
  score: number;
  strengths: Array<{ point: string; explanation: string }>;
  gaps: Array<{ point: string; explanation: string }>;
  unknowns: Array<{ point: string; explanation: string }>;
  courseRecommendations: Array<{ point: string; explanation: string }>;
};

export type Ranking = {
  role_title: string;
  ranking: Array<{
    rank: number;
    candidate_id: string;
    candidate_label: string;
    score: number;
    qualified: boolean;
    summary: string;
  }>;
};

export type ApiCandidate = {
  id: number;
  name?: string | null;
  email?: string | null;
  created_at?: string;
  cv_pdf?: Buffer | null;
  cv_markdown?: string | null;
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
  courseRecommendations: string[];
  summary: string;
  experience: string[];
  education: string[];
  email: string;
  phone: string;
};

export type Screening = {
  title: string;
  header: string;
  description: string;
  must_have_qualifications: string[];
  nice_to_have_qualifications: string[];
  candidates: Array<{
    candidateId: number;
    rank: number;
    score: number;
    qualified: boolean;
    qualifications_met: string[];
    qualifications_missing: string[];
    course_recommendations: string[];
    unknowns: string[];
    summary?: string;
  }>;
};

export type RunScreeningResponse = {
  screeningRecord: Screening;
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
