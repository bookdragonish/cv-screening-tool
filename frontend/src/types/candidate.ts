
export type Candidate = {
    id: number,
    name: string,
    email: string,
    cv_pdf?: string | null,
    has_pdf: boolean,
    created_at: string,
    aml46?: boolean,
    aml47?: boolean,
    ansiennitet?: number | null,
}

export type CandidatePreview = {
  id: number;
  name: string;
};

