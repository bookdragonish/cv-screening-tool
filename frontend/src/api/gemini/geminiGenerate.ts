import {
  type Content,
  type ContentListUnion,
  GoogleGenAI,
  type Part,
  createPartFromUri,
} from "@google/genai";
import type { UploadedGeminiFile } from "@/api/gemini/multipleFileUpload";

export async function generateFromGeminiOnFiles(params: {
  ai: GoogleGenAI;
  model: string;
  files: UploadedGeminiFile[];
  prompt: string;
  labelFiles?: boolean;
}): Promise<string> {
  const { ai, model, files, prompt, labelFiles = true } = params;

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

  const response = await ai.models.generateContent({
    model,
    contents: [userContent],
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