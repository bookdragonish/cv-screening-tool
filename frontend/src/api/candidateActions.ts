import { API_URL } from "./fetchCandidates";

export async function deleteCandidate(id: number) {
  const response = await fetch( API_URL + "/api/candidates/" + id, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Response Status: ${response.status}`);
  }
  const result = await response.json();
  console.log(result)
  return result;
}

// TODO: Legg til edit-funksjon