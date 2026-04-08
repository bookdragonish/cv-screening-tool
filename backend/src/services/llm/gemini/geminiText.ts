import type { Content } from "@google/genai";
import { GoogleGenAI } from "@google/genai";

/**
 * Sends a text-only prompt to Gemini and returns the first text response.
 */
export async function generateFromGeminiText(params: {
  ai: GoogleGenAI;
  model: string;
  prompt: string;
  forceJsonResponse?: boolean;
}): Promise<string> {
  const { ai, model, prompt, forceJsonResponse = false } = params;

  const userContent: Content = {
    role: "user",
    parts: [{ text: prompt }],
  };

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
