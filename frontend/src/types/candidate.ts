
export type Candidate = {
    id: number,
    name: string,
    email: string,
    cv_pdf?: string | null,
    has_pdf: boolean,
    created_at: string
}

export type CandidatePreview = {
  id: number;
  name: string;
};

