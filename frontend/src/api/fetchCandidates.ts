import { API_URL } from "@/utils/variables";


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

export async function deleteCandidate(id: number) {
  const response = await fetch( API_URL + "/api/candidates/" + id, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Response Status: ${response.status}`);
  }
  const result = await response.json();
  return result;
}

// TODO: Legg til edit-funksjon

