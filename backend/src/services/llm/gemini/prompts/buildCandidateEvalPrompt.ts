import type { JobProfile } from "../../../../types/ai.types.js";
import { RULES, RUBRIC } from "./rulesAndRubric.js";

/**
 * Builds the prompt used to score one candidate CV against a job profile.
 */
export function buildCandidateEvalPrompt(args: {
  jobProfile: JobProfile;
  candidateId: string;
  candidateLabel: string;
}): string {
  return `
<role>Du er et CV screening system</role>

<task>
- Evaluer den tilknyttede CVen mot jobb annonsen.
- Forhold deg til reglene og bruk rubrikken.
</task>

<constraints>
${RULES}

${RUBRIC}
</constraints>

<language_rules>
- Alle deskriptive felter som "candidate_role", "experience_highlights", "education", "strengths.point", "strengths.evidence", "gaps.point", "gaps.evidence", og "unknowns" må forbli på engelsk MEN verdiene MÅ skrives på Norsk Bokmål.
- Hold alle egennavn, teknologier, sertifikater, mobilnumre, og epost adresser i deres originale form.
</language_rules>

<context>
<job_profile_json>
${JSON.stringify(args.jobProfile)}
</job_profile_json>

<candidate_id>${args.candidateId}</candidate_id>
<candidate_label_hint>${args.candidateLabel}</candidate_label_hint>
</context>

<output_format>
Returner KUN gyldig JSON med dette formatet:
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

Endelig output:
JSON:
`.trim();
}
