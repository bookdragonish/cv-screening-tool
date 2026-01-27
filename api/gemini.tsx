import { GoogleGenAI } from "@google/genai";

const API_KEY = "AIzaSyAH7jNQbublk7_g6L29odJONefXYWqe64Y";

const ai = new GoogleGenAI({ apiKey: API_KEY });

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Explain how AI works in a few words",
  });
  console.log(response.text);
}

main();
