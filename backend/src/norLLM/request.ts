const url = "https://llm.hpc.ntnu.no/v1/chat/completions";

export default async function run() {
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
          content: "Hvem er du?"
        }
      ]
    })
  });

  const data = await response.json();
  return data;
}