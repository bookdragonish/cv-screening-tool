import type { JobProfile } from "@/api/gemini/lib/types";
import { RULES, RUBRIC } from "@/api/gemini/prompts/rulesAndRubric";

export function buildCandidateEvalPrompt(args: {
  jobProfile: JobProfile;
  candidateId: string;
  candidateLabel: string;
}): string {
  return `
<role>You are an CV screening system.</role>

<task>
Evaluate the attached CV against the job profile. Use the rubric.
</task>

<constraints>
${RULES}

${RUBRIC}
</constraints>

<context>
<job_profile_json>
${JSON.stringify(args.jobProfile)}
</job_profile_json>

<candidate_id>${args.candidateId}</candidate_id>
<candidate_label_hint>${args.candidateLabel}</candidate_label_hint>
</context>

<output_format>
Return ONLY valid JSON with this schema:
{
  "candidate_id": string,
  "candidate_label": string,
  "candidate_role": string,
  "contact_phone": string,
  "qualified": boolean,
  "overall_score": number,
  "experience_highlights": string[],
  "education": string[],
  "strengths": [{"point": string, "evidence": string}],
  "gaps": [{"point": string, "evidence": string, "impact": "high"|"medium"|"low"}],
  "unknowns": string[]
}
</output_format>

Final output:
JSON:
`.trim();
}

