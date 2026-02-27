import { API_URL } from "./fetchCandidates";

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
    summary?: string;
    createdAt: string;
  }>;
};

export async function getScreeningHistory(): Promise<ScreeningDetails[]> {
  const response = await fetch(API_URL + "/api/results/history");
  if (!response.ok) {
    throw new Error(`Response Status: ${response.status}`);
  }
  const result = await response.json();
  return result;
}

export async function getScreeningByJobPostId(
  jobPostId: number,
): Promise<ScreeningDetails> {
  const response = await fetch(API_URL + `/api/results/job_posts/${jobPostId}`);
  if (!response.ok) {
    throw new Error(`Response Status: ${response.status}`);
  }
  const result: ScreeningDetails = await response.json();

  return result;
}
