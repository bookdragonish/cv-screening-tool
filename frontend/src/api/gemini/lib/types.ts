export type JobProfile = {
  role_title: string;
  must_haves: string[];
  nice_to_haves: string[];
};

export type CandidateEval = {
  candidate_id: string;
  candidate_label: string;
  candidate_role?: string;
  contact_phone?: string;
  qualified: boolean;
  overall_score: number;
  experience_highlights?: string[];
  education?: string[];
  strengths: Array<{ point: string; evidence: string }>;
  gaps: Array<{ point: string; evidence: string; impact: "high" | "medium" | "low" }>;
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
