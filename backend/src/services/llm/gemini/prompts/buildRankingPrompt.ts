import type { CandidateEval, JobProfile } from "../../../../types/ai.types.js";
import { RULES } from "./rulesAndRubric.js";

/**
 * Builds the prompt used to rank all candidates from completed evaluations.
 */
export function buildRankingPrompt(args: {
  jobProfile: JobProfile;
  evals: CandidateEval[];
}): string {
  return `
<role>Du er et system som skal evaluere kandidater og rangere de opp mot "job_profile_json" for denne screeningen.</role>

<task>
- Vurder kandidatene kun på kvalifikasjonskravene de har oppnådd fra stillingsannonsen
- Returner all deskriptiv tekst på norsk bokmål.
</task>

<constraints>
${RULES}
</constraints>

<role_title_rules>
- "role_title" MUST match the job title from the provided job profile, including the company or organization name when present there.
</role_title_rules>


<context>
<job_profile_json>
${JSON.stringify(args.jobProfile)}
</job_profile_json>

<output_format>
Returner KUN gyldig JSON med dette formatet:
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
