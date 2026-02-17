import type { Content } from "@google/genai";
import { GoogleGenAI } from "@google/genai";

export async function generateFromGeminiText(params: {
  ai: GoogleGenAI;
  model: string;
  prompt: string;
}): Promise<string> {
  const { ai, model, prompt } = params;

  const userContent: Content = {
    role: "user",
    parts: [{ text: prompt }],
  };

  const response = await ai.models.generateContent({
    model,
    contents: [userContent],
  });

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
  return text ?? "Tom respons, noe feilet";
}