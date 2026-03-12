import type { SaveScreeningRunPayload } from "@/api/fetchScreenings";
import type { JobDescriptionInput } from "@/components/newScreening/UploadJobDescriptionSchema";
import type { ScreeningCandidate } from "@/types/newScreeningTypes";
import { API_URL } from "@/utils/variables";

type RunScreeningResult = {
  candidates: ScreeningCandidate[];
  requiredSkills: string[];
  screeningRecord: SaveScreeningRunPayload;
};

function toRunScreeningFormData(params: {
  jobDescriptionInput: JobDescriptionInput;
  candidateLimit?: number;
}): FormData {
  const { jobDescriptionInput, candidateLimit } = params;

  const formData = new FormData();
  formData.append("mode", jobDescriptionInput.mode);

  if (Number.isFinite(candidateLimit)) {
    formData.append("candidateLimit", String(candidateLimit));
  }

  if (jobDescriptionInput.mode === "text") {
    formData.append("jobDescriptionText", jobDescriptionInput.text);
  } else {
    formData.append("jobDescriptionFile", jobDescriptionInput.file, jobDescriptionInput.file.name);
  }

  return formData;
}

async function parseErrorMessage(response: Response): Promise<string> {
  const fallbackMessage = `Response Status: ${response.status}`;

  try {
    const json = (await response.json()) as { error?: string };
    if (typeof json?.error === "string" && json.error.trim()) {
      return json.error;
    }
  } catch {
  }

  return fallbackMessage;
}

export async function runScreeningWithGemini(params: {
  jobDescriptionInput: JobDescriptionInput;
  candidateLimit?: number;
}): Promise<RunScreeningResult> {
  const response = await fetch(API_URL + "/api/results/screenings/run", {
    method: "POST",
    body: toRunScreeningFormData(params),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as RunScreeningResult;
}
