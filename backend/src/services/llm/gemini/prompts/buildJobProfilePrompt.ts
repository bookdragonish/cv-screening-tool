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
- Kun harde kvalifikasjonskrav skal inngå i "must_haves".
- Harde kvalifikasjonskrav defineres som krav som ville vært naturlig å plassere i en CV om kravet er oppfylt.
- Kvalifikasjonskrav du fyller inn i "must_haves" MÅ være hentet fra jobbannonsen OG IKKE noe du finner på selv.
- Kvalifikasjonskrav som baserer seg på personlighet skal ikke inkluderes.
</must_haves_rules>

<output_format>
Returner KUN gyldig JSON med dette formatet:
{
  "role_title": string,
  "must_haves": string[],
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
 * Builds the prompt used to extract a job profile from an uploaded PDF.
 */
export function buildJobProfileFromPdfPrompt(): string {
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
- Kun harde kvalifikasjonskrav skal inngå i "must_haves".
- Harde kvalifikasjonskrav defineres som krav som ville vært naturlig å plassere i en CV om kravet er oppfylt.
- Kvalifikasjonskrav du fyller inn i "must_haves" MÅ være hentet fra jobbannonsen OG IKKE noe du finner på selv.
- Kvalifikasjonskrav som baserer seg på personlighet skal ikke inkluderes.
</must_haves_rules>

<output_format>
Returner KUN gyldig JSON med dette formatet:
{
  "role_title": string,
  "must_haves": string[],
}
</output_format>

Endelig output:
JSON:
`.trim();
}

/**
 * Backward-compatible alias for job-ad text prompt builder.
 */
export const buildJobAdProfilePrompt = buildJobProfileFromTextPrompt;
