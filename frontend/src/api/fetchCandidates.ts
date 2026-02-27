export const API_URL = "http://localhost:3000";

export async function getAllCandidates() {
  const response = await fetch(API_URL + "/api/candidates");
  if (!response.ok) {
    throw new Error(`Response Status: ${response.status}`);
  }
  const result = await response.json();
  return result;
}

export async function getCandidate(id: string) {
  const response = await fetch(API_URL + "/api/candidates/" + id);
  if (!response.ok) {
    throw new Error(`Response Status: ${response.status}`);
  }
  const result = await response.json();
  return result;
}

