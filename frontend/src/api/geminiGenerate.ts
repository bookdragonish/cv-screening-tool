import {
  type ContentListUnion,
  GoogleGenAI,
  createPartFromUri,
} from "@google/genai";
import type { UploadedGeminiFile } from "./multipleFileUpload";

export async function generateFromGeminiOnFiles(params: {
  ai: GoogleGenAI;
  model: string;
  files: UploadedGeminiFile[];
  prompt: string;
  labelFiles?: boolean;
}): Promise<string> {
  const { ai, model, files, prompt, labelFiles = true } = params;

  const contents: ContentListUnion = [];

  contents.push(prompt);

  for (const f of files) {
    if (labelFiles) {
      contents.push(`File: ${f.displayName}`);
    }
    contents.push(createPartFromUri(f.uri, f.mimeType));
  }

  const response = await ai.models.generateContent({
    model,
    contents,
  });

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
  return text ?? "Tom respons, noe feilet";
}

export async function deleteGeminiFiles(
  ai: GoogleGenAI,
  files: UploadedGeminiFile[]
): Promise<void> {
  await Promise.all(
    files.map((f) => ai.files.delete({ name: f.uploadId }))
  );
}