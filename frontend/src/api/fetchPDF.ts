import { API_URL } from "@/utils/variables";

export async function getPDF(id: string) {
  const response = await fetch(API_URL + "/api/candidates/" + id + "/cv");
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Response Status: ${response.status}`);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  console.log(url);
  return url;
}