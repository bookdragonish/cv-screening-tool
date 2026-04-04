import type { SaveScreeningRunPayload, ScreeningDetails } from "@/types/screening";
import { API_URL } from "@/utils/variables";


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

export async function saveScreeningRun(
  payload: SaveScreeningRunPayload,
): Promise<ScreeningDetails> {
  const response = await fetch(API_URL + "/api/results/screenings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Response Status: ${response.status}`);
  }

  const result = await response.json();
  return result;
}

