export type ScreeningDetails = {
  jobPostId: number;
  title: string;
  screenedAt: string;
  aiJobDescription?: string,
  must_have_qualifications: string[];
  nice_to_have_qualifications: string[];
  candidates: Array<RankedCandidate>;
};


export type RankedCandidate = {
  candidateId: number;
  candidateName: string;
  rank: number;
  score: number;
  qualified: boolean;
  qualifications_met: string[];
  qualifications_missing: string[];
  course_recommendations: string[];
  unknowns: string[];
  summary?: string;
  createdAt: string;
  aml46?: boolean,
  aml47?: boolean,
  ansiennitet?: [number | null, number | null, number | null] | null,
  hasPdf?: boolean,
};

export type CandidateScreeningEntry = {
  jobPostId: number;
  title: string;
  screenedAt: string;
  candidateResult: RankedCandidate;
  totalCandidates: number;
};

export type SaveScreeningRunPayload = {
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

