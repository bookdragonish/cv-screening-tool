import type { NorLlmResponse } from "../../../types/GeminiTypes.js";

const NORLLM_URL = "https://llm.hpc.ntnu.no/v1/chat/completions";
const NORLLM_MODEL = "NorwAI/NorwAI-Magistral-24B-reasoning";

export async function callNorLlm(prompt: string): Promise<string> {
  const apiKey = process.env.NORLLM_KEY;
  if (!apiKey) {
    throw new Error("Mangler NORLLM_KEY.");
  }

  const response = await fetch(NORLLM_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: NORLLM_MODEL,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `NorLLM feilet: ${response.status}.`);
  }

  const data = (await response.json()) as NorLlmResponse;
  const content = data.choices?.[0]?.message?.content;

  if (!content?.trim()) {
    throw new Error("NorLLM ga ikke tilbake noe tekst.");
  }

  return content;
}

// Repair function to ensure correct format of output
export async function parseNorLlmJsonWithRepair<T>(params: {
  rawText: string;
  schemaDescription: string;
  parse: (text: string) => T;
}): Promise<T> {
  const { rawText, schemaDescription, parse } = params;

  try {
    return parse(rawText);
  } catch {
    const repairPrompt = [
      "You are a strict JSON formatter.",
      "Convert the content below into a valid JSON object that matches the schema.",
      "Return only JSON. Use double quotes for all keys and string values.",
      "Do not add markdown code fences.",
      "",
      "Schema:",
      schemaDescription,
      "",
      "Content to repair:",
      rawText,
    ].join("\n");

    const repairedText = await callNorLlm(repairPrompt);
    return parse(repairedText);
  }
}