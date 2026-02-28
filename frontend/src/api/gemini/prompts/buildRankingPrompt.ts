import type { CandidateEval, JobProfile } from "@/api/gemini/lib/types";
import { RULES } from "@/api/gemini/prompts/rulesAndRubric";

export function buildRankingPrompt(args: {
  jobProfile: JobProfile;
  evals: CandidateEval[];
}): string {
  return `
<role>You are an CV ranking system.</role>

<task>
- Rank candidates using ONLY the provided candidate evaluations.
- Do not re-interpret CVs.
- Do not invent evidence.
</task>

<constraints>
${RULES}
</constraints>

<context>
<job_profile_json>
${JSON.stringify(args.jobProfile)}
</job_profile_json>

<candidate_evaluations_json>
${JSON.stringify(args.evals)}
</candidate_evaluations_json>
</context>

<output_format>
Return ONLY valid JSON with this schema:
{
  "role_title": string,
  "ranking": [
    {
      "rank": number,
      "candidate_id": string,
      "candidate_label": string,
      "overall_score": number,
      "qualified": boolean,
      "summary": string
    }
  ]
}
</output_format>

Final output:
JSON:
`.trim();
}

