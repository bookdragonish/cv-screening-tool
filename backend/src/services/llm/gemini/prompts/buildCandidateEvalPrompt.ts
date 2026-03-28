import type { JobProfile } from "../../../../types/ai.types.js";
import { RULES, RUBRIC } from "./rulesAndRubric.js";

/**
 * Builds the prompt used to score one candidate CV against a job profile.
 */
export function buildCandidateEvalPrompt(args: {
  jobProfile: JobProfile;
  candidateId: string;
  candidateLabel: string;
  cvText?: string;
}): string {
  const hasCvText = Boolean(args.cvText?.trim());

  return `
<role>You are an CV screening system.</role>

<task>
Evaluate the candidate CV against the job profile. Use the rubric.
</task>

<constraints>
${RULES}

${RUBRIC}
</constraints>

<language_rules>
- All descriptive fields such as "candidate_role", "experience_highlights", "education", "strengths.point", "strengths.evidence", "gaps.point", "gaps.evidence", and "unknowns" must be written in Norwegian Bokmal.
- Keep names, company names, technologies, certificates, phone numbers, and email addresses in their original form when needed.
</language_rules>

<context>
<job_profile_json>
${JSON.stringify(args.jobProfile)}
</job_profile_json>

<candidate_id>${args.candidateId}</candidate_id>
<candidate_label_hint>${args.candidateLabel}</candidate_label_hint>
${
  hasCvText
    ? `<candidate_cv_text>
${args.cvText}
</candidate_cv_text>`
    : ""
}
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
