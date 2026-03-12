import { RULES } from "./rulesAndRubric.js";

/**
 * Builds the prompt used to extract a job profile from pasted job text.
 */
export function buildJobProfileFromTextPrompt(jobAdText: string): string {
  return `
<role>You are a job requirements parser.</role>

<task>
Extract a job profile from the job advertisement.
</task>

<constraints>
${RULES}
</constraints>

<role_title_rules>
- "role_title" MUST include both the job title and the hiring company or organization when the employer is identifiable in the source text.
- Format "role_title" as "<job title> - <company or organization>".
- If the employer is not identifiable, use the job title alone.
- Write the job title portion in Norwegian Bokmal. Keep the company or organization name in its original form.
</role_title_rules>

<output_format>
Return ONLY valid JSON with this schema:
{
  "role_title": string,
  "must_haves": string[],
  "nice_to_haves": string[]
}
</output_format>

<context>
<job_ad>
${jobAdText}
</job_ad>
</context>

Final output:
JSON:
`.trim();
}

/**
 * Builds the prompt used to extract a job profile from an uploaded PDF.
 */
export function buildJobProfileFromPdfPrompt(): string {
  return `
<role>You are a job requirements parser.</role>

<task>
Extract a structured job profile from the attached job description PDF.
</task>

<constraints>
${RULES}
</constraints>

<role_title_rules>
- "role_title" MUST include both the job title and the hiring company or organization when the employer is identifiable in the PDF.
- Format "role_title" as "<job title> - <company or organization>".
- If the employer is not identifiable, use the job title alone.
- Write the job title portion in Norwegian Bokmal. Keep the company or organization name in its original form.
</role_title_rules>

<output_format>
Return ONLY valid JSON with this schema:
{
  "role_title": string,
  "must_haves": string[],
  "nice_to_haves": string[]
}
</output_format>

Final output:
JSON:
`.trim();
}

/**
 * Backward-compatible alias for job-ad text prompt builder.
 */
export const buildJobAdProfilePrompt = buildJobProfileFromTextPrompt;
