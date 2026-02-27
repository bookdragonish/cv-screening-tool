export type JobProfile = {
  role_title: string;
  must_haves: string[];
  nice_to_haves: string[];
};

export type CandidateEval = {
  candidate_id: string;
  candidate_label: string;
  qualified: boolean;
  overall_score: number;
  strengths: Array<{ point: string; evidence: string }>;
  gaps: Array<{ point: string; evidence: string; }>;
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