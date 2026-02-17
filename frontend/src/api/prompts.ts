import type { CandidateEval, JobProfile } from "@/api/types";

const RULES = `
Rules:
- Evidence-based only (quote CV snippets as evidence).
- Do not guess. If unclear or missing, add to "unknowns".
- Output MUST be JSON only. No markdown, no commentary, no code fences.
`.trim();

const RUBRIC = `
Scoring rubric (0–100):
- Must-have match (0–60)
- Relevant experience depth (0–30)
- Clarity/structure (0–10)
`.trim();

export function buildJobAdProfilePrompt(jobAdText: string): string {
  return `
<role>You are a job requirements parser.</role>

<task>
Extract a job profile from the job advertisement.
</task>

<constraints>
${RULES}
</constraints>

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
  "qualified": boolean,
  "overall_score": number,
  "strengths": [{"point": string, "evidence": string}],
  "gaps": [{"point": string, "evidence": string, "impact": "high"|"medium"|"low"}],
  "unknowns": string[]
}
</output_format>

Final output:
JSON:
`.trim();
}

export function buildRankingPrompt(args: {
  jobProfile: JobProfile;
  evals: CandidateEval[];
}): string {
  return `
<role>You are an ATS ranking system.</role>

<task>
Rank candidates using ONLY the provided candidate evaluations.
Do not re-interpret CVs. Do not invent evidence.
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