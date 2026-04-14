import type { JobProfile } from "../../../types/ai.types.js";
import { RULES, RUBRIC } from "./rulesAndRubric.js";

type CandidateInput = {
  candidateId: string;
  candidateLabel: string;
  cvText: string;
};

/**
 * Builds the prompt that evaluates the candidates using their CV.
 */
export function buildCandidatesEvaluationPrompt(args: {
  jobProfile: JobProfile;
  candidates: CandidateInput[];
}): string {
  const candidatesJson = JSON.stringify(
    args.candidates.map((candidate) => ({
      candidate_id: candidate.candidateId,
      candidate_label: candidate.candidateLabel,
      cv_text: candidate.cvText,
    })),
  );

  return `
<role>Du er en HR-ansatt som skal finne kvalifiserte kandidater for en jobb.</role>

<task>
- Evaluer ALLE kandidater mot kvalifikasjonene i job_profile_json.must_haves.
- Om kandidaten mangler en kvalifikasjon fra must_haves, skal qualified settes til false og kvalifikasjonen skal listes i gaps med en forklaring og vurdert impact.
- Om kandidaten har en kvalifikasjon fra must_haves eller nice_to_haves, skal den listes i strengths med en forklaring.
- Hvis det er uklart ut ifra CV-en om kandidaten oppfyller en kvalifikasjon, skal den listes i unknowns.
- Scoren skal være bestemt utifra antall kvalifikasjoner i både must_haves og nice_to_haves som er oppfylt.
- Ikke bruk andre kriterier enn disse kvalifikasjonene.
- ALLE kvalifikasjoner MÅ ende opp i enten strengths, gaps eller unknowns.
</task>

<constraints>
${RULES}

${RUBRIC}
</constraints>

<qualification_rules>
- strengths.point, gaps.point og unknowns[] MÅ være eksakt tekst fra job_profile_json.must_haves eller job_profile_json.nice_to_haves.
- Ikke legg til egne krav eller tolkninger som ikke står i must_haves.
- For hver kandidat: Hver kvalifikasjon i must_haves skal kun havne i én av disse: strengths.point, gaps.point eller unknowns.
- Hvis dokumentasjon i CV er uklar, legg kvalifikasjonen i unknowns.
</qualification_rules>

<language_rules>
- Alle deskriptive feltverdier skrives på norsk bokmål.
- Hold egennavn, teknologi-navn, sertifikater, telefonnummer og e-post i original form.
</language_rules>

<context>
<job_profile_json>
${JSON.stringify(args.jobProfile)}
</job_profile_json>

<candidates_json>
${candidatesJson}
</candidates_json>
</context>

<output_format>
Returner KUN gyldig JSON med dette formatet:
{
  "evaluations": [
    {
      "candidate_id": string,
      "candidate_name": string,
      "summary": string,
      "qualified": boolean,
      "overall_score": number,
      "strengths": [{"point": string, "explanation": string}],
      "gaps": [{"point": string, "explanation": string}],
      "unknowns": [{"point": string, "explanation": string}]
    }
  ]
}
</output_format>


Final output:
JSON:
`.trim();
}
