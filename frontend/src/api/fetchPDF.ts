import { API_URL } from "@/utils/variables";

export async function getPDFBlob(id: string): Promise<Blob | null> {
  const response = await fetch(API_URL + "/api/candidates/" + id + "/cv");
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Response Status: ${response.status}`);
  }

  return response.blob();
}

export async function getPDF(id: string) {
  const blob = await getPDFBlob(id);
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  console.log(url);
  return url;
}
