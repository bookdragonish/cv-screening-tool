import {
  type Content,
  GoogleGenAI,
  type Part,
} from "@google/genai";

export type UploadedGeminiFile = {
  uri: string;
  mimeType: string;
  displayName: string;
  uploadId: string;
};

/**
 * Sends a prompt and one or more uploaded files to Gemini.
 *
 * Returns only the first text response from Gemini.
 */
export async function generateFromGeminiOnFiles(params: {
  ai: GoogleGenAI;
  model: string;
  files: UploadedGeminiFile[];
  prompt: string;
  labelFiles?: boolean;
  forceJsonResponse?: boolean;
}): Promise<string> {
  const { ai, model, files, prompt, labelFiles = true, forceJsonResponse = false } = params;

  const parts: Part[] = [{text: prompt}];


  for (const f of files) {
    if (labelFiles) {
      parts.push({text: `\nFile: ${f.displayName}`});
    }

    parts.push({
      fileData: {mimeType: f.mimeType, fileUri: f.uri}
    })
  }

  const userContent: Content = {
    role: "user",
    parts: parts,
  }

  const request = {
    model,
    contents: [userContent],
    ...(forceJsonResponse
      ? { config: { responseMimeType: "application/json" } }
      : {}),
  };

  const response = await ai.models.generateContent(request);

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
  return text ?? "Tom respons, noe feilet";
}

/**
 * Deletes uploaded Gemini files after processing.
 */
export async function deleteGeminiFiles(
  ai: GoogleGenAI,
  files: UploadedGeminiFile[]
): Promise<void> {
  await Promise.all(
    files.map((f) => ai.files.delete({ name: f.uploadId }))
  );
}
