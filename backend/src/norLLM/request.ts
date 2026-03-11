import { parsePdf } from "../middleware/PdfParser.js";

const url = "https://llm.hpc.ntnu.no/v1/chat/completions";

export default async function run(pdfBuffer: Buffer): Promise<unknown> {
  const cvText = await parsePdf(pdfBuffer);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + process.env.NORLLM_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "NorwAI/NorwAI-Magistral-24B-reasoning",
      messages: [
        {
          role: "user",
          content: `Summarize the key points in this CV:\n\n${cvText}`
        }
      ]
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(err);
  }

  return response.json();
}