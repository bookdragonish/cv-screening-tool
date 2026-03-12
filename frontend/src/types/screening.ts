export type ScreeningDetails = {
  jobPostId: number;
  title: string;
  screenedAt: string;
  candidates: Array<{
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
  }>;
};
