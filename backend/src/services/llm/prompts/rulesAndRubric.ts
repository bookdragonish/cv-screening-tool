/**
 * Shared rules included in Gemini prompts to keep outputs consistent and safe.
 */
const RULES = `
Rules:
- Evidence-based only (quote CV snippets as evidence).
- Do not guess. If unclear or missing, add to "unknowns".
- Output MUST be JSON only. No markdown, no commentary, no code fences.
- All free-text and descriptive output values MUST be written in Norwegian Bokmal.
- Keep proper nouns and fixed source values as-is when appropriate, including person names, company names, product names, technologies, certificates, IDs, phone numbers, and email addresses.
- Do not translate fixed enum values required by the schema.
- Treat candidates only based on their qualifications.
- The total score MUST be based on the scoring rubric.
`.trim();

/**
 * Shared scoring weights used when Gemini evaluates candidates.
 */
const RUBRIC = `
Rubrikk for vurdering (0–100):
- Match av must_haves og nice_to_haves (0-100)
- Vurderingen skal basere seg på hvor mange must_haves og nice_to_haves som tydelig er oppfylt basert på bevis fra CVene.
`.trim();

export { RULES, RUBRIC };
