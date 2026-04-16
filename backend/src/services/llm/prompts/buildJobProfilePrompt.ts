import { RULES } from "./rulesAndRubric.js";

/**
 * Builds the prompt used to extract a job profile from pasted job text.
 */
export function buildJobProfileFromTextPrompt(jobAdText: string): string {
  return `
<role>Du er et system som finner relevant informasjon fra en jobbannonse.</role>

<task>
- Oppgaven din er å hente ut krav til kandidatene i en stillingannonse.
- Forhold deg til reglene.
</task>

<constraints>
${RULES}
</constraints>

<role_title_rules>
- Felted "role_title" MÅ inkludere både tittelen på jobbannonsen OG navnet på bedriften eller organisasjonen når det er mulig å hente i teksten.
- Formater "role_title" som "<jobbtittel> - <bedrift eller organisasjon>".
- Hvis bedriften eller organisasjon ikke er mulig å identifisere, bruk kun jobbtittelen.
- Skriv jobbtittelen på norsk bokmål. Behold bedrift eller organisasjons navnet i sin originale form.
</role_title_rules>

<must_haves_rules>
- Kvalifikasjonskrav i "must_haves" skal være de mest kritiske kravene for stillingen, altså de som er avgjørende for om en kandidat er kvalifisert eller ikke.
- Kvalifikasjonskrav du fyller inn i "must_haves" MÅ være hentet fra jobbannonsen OG IKKE noe du finner på selv.
- Om annonsen eksplisitt inneholder at et krav kan kompensere for et annet, skal disse slås sammen til ett krav i must_haves.
</must_haves_rules>

<nice_to_haves_rules>
- Kvalifikasjonskrav i "nice_to_haves" skal være de kravene som omhandler erfaring og kompetanse som er ønskelig, og som er naturlig å skrive inn i en CV, i motsetning til personlige egenskaper og myke kvalifikasjoner.
- Kvalifikasjonskrav du fyller inn i "nice_to_haves" MÅ være hentet fra jobbannonsen OG IKKE noe du finner på selv.
- Kvalifikasjonskrav som baserer seg på personlighet og myke kvalifikasjoner skal ikke inkluderes.
</nice_to_haves_rules>

<output_format>
Returner KUN gyldig JSON med dette formatet:
{
  "role_title": string,
  "must_haves": string[],
  "nice_to_haves": string[],
}
</output_format>

<context>
<job_ad>
${jobAdText}
</job_ad>
</context>

Endelig output:
JSON:
`.trim();
}

/**
 * Backward-compatible alias for job-ad text prompt builder.
 */
export const buildJobAdProfilePrompt = buildJobProfileFromTextPrompt;
