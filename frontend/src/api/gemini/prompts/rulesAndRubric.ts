const RULES = `
Rules:
- Evidence-based only (quote CV snippets as evidence).
- Do not guess. If unclear or missing, add to "unknowns".
- Output MUST be JSON only. No markdown, no commentary, no code fences.
- Treat candidates only based on their qualifications.
- The total score MUST be based on the scoring rubric.
`.trim();

const RUBRIC = `
Scoring rubric (0–100):
- Must-have match (0–70)
- Relevant experience depth (0–30)
`.trim();

export { RULES, RUBRIC };

