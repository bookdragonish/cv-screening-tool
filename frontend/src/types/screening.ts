export type ScreeningDetails = {
  jobPostId: number;
  title: string;
  screenedAt: string;
  aiJobDescription?: string,
  candidates: Array<RankedCandidate>;
};


export type RankedCandidate = {
  candidateId: number;
  candidateName: string;
  rank: number;
  score: number;
  qualified: boolean;
  qualificationsMet: string[];
  qualificationsMissing: string[];
  unknowns: string[];
  summary?: string;
  createdAt: string;
  aml46?: boolean,
  aml47?: boolean,
  ansiennitet?: [number | null, number | null, number | null] | null,
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

