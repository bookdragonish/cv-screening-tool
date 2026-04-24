# How to Add a New AI Model Provider

This document explains how to add a new AI model provider to the screening flow.

The current implementation supports:

- `gemini`
- `norllm`

Both providers follow the same overall structure and expose the same core functionality through a shared provider shape.



## Overview

To add a new AI model, you need to:

1. Create a new provider folder under `backend/src/services/llm/`
2. Implement the provider factory and supporting logic
3. Add the provider to `llm.service.ts`
4. Add the provider type to `llm.types.ts`
5. Add the required environment variables to `.env`


## Current Structure

The LLM providers are located in:

```text
backend/src/services/llm/
```

Current examples:
```
llm/
├── gemini/
│   ├── gemini.provider.ts
│   ├── geminiGenerate.ts
│   ├── geminiText.ts
│   ├── schemas.ts
│   └── prompts/
├── norLLM/
│   ├── norllm.client.ts
│   ├── norllm.parser.ts
│   ├── norllm.provider.ts
│   ├── request.ts
│   └── prompts/
├── llm.service.ts
└── llm.types.ts
```

## What a Provider Must Do

Each provider must support the same screening flow:

- Load candidates
- Read or extract job description text
- Create a job profile
- Evaluate candidates against the job profile

This is reflected in the provider types in llm.types.ts.

### Step 1: Create a New Provider Folder

Create a new folder inside:

```
backend/src/services/llm/
```

For example, if you are adding OpenAI:

```text
backend/src/services/llm/openai/
```

A typical structure might look like:

```
openai/
├── openai.provider.ts
├── openai.client.ts
├── openai.parser.ts
├── requests.ts
└── prompts/
```

The exact file names can vary, but keeping the same structure as gemini and norllm is recommended for consistency.

### Step 2: Implement the Provider Factory
Your provider should expose a factory function similar to the existing providers.

Example:
```
export function createOpenaiProvider() {
  return {
    kind: "openai",

    async loadCandidates(limit) {
      // implementation
    },

    async getJobDescriptionText(input) {
      // implementation
    },

    async createJobProfile(input, jobDescriptionText) {
      // implementation
    },

    async evaluateCandidates({ candidatesWithCv, jobProfile }) {
      // implementation
    },
  };
}
```

The returned object must match the same method contract as the existing providers.

### Step 3: Add the Provider to llm.service.ts

The file llm.service.ts is responsible for selecting the active provider based on the LLM environment variable.

Current structure:
```
import { createGeminiProvider } from "./gemini/gemini.provider.js";
import { createNorllmProvider } from "./norLLM/norllm.provider.js";

export interface LlmMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function getLlmProvider() {
  const provider = (process.env.LLM ?? "gemini").trim().toLowerCase();

  switch (provider) {
    case "gemini":
      return createGeminiProvider();

    case "norllm":
      return createNorllmProvider();

    default:
      throw new Error(`Unsupported LLM provider: ${provider}`);
  }
}
```
### Step 4: Update llm.types.ts

Each provider currently has its own type, but they all expose the same function signatures.

Current examples:
```
export type GeminiProvider = {
  kind: "gemini";

  loadCandidates(limit: number): Promise<CandidateWithCvText[]>;

  getJobDescriptionText(
    input: JobDescriptionInput,
  ): Promise<string>;

  createJobProfile(
    input: JobDescriptionInput,
    jobDescriptionText: string,
  ): Promise<JobProfile>;

  evaluateCandidates(params: {
    candidatesWithCv: CandidateWithCvText[];
    jobProfile: JobProfile;
  }): Promise<CandidateEval[]>;
};
```
To add a new provider, create a matching type. Then add it to the union type:
```
export type ScreeningLlmProvider =
  | GeminiProvider
  | NorllmProvider
  | OpenaiProvider;
```
### Step 5: Add Environment Variables

Add the required keys to the backend .env file.

Example:
```
LLM="openai"
OPENAI_API_KEY=""
```

### Step 6: Implement Provider-Specific Logic

Each provider will usually need some provider-specific utilities. These often include:

- API client setup
- Request formatting
- Response parsing
- Prompt templates
- Schema validation
- Error handling
- Common Patterns from Existing Providers
- Gemini

The most important rule when adding a new provider is: The rest of the application should not need to care which provider is active.

In practice, this means:

- createJobProfile() must return a valid JobProfile
- evaluateCandidates() must return valid CandidateEval[]
- output must match the shared application types
- any provider-specific response format must be parsed before leaving the provider layer

This is what keeps the rest of the backend independent from model-specific details.

If the provider uses prompt-based generation, add a prompts/ folder and follow the same pattern as the other providers. For more info see the documentation on prompts.
