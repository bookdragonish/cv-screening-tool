import { createGeminiProvider } from "./gemini/gemini.provider.js";
import { createNorllmProvider } from "./norLLM/norllm.provider.js";

const provider = process.env.LLM_PROVIDER ?? "gemini";

export interface LlmMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function getLlmProvider() {
  switch (provider) {
    case "gemini":
      return createGeminiProvider();;

    case "norllm":
      return createNorllmProvider();

    default:
      throw new Error(`Unsupported LLM provider: ${provider}`);
  }
}