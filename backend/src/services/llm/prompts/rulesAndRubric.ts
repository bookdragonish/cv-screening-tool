/**
 * Shared rules included in Gemini prompts to keep outputs consistent and safe.
 */
const RULES = `
Regler:
- Baser deg kun på bevis.
- Ikke gjør antagelser. Hvis noe er uklart eller mangler, legg det til under "unknowns".
- Output SKAL være KUN JSON. Ikke noe markdown, ingen kommentarer, ingen kodegjerder.
- All fritekst og deskriptive tekstfelter skal skrives på norsk bokmål.
- Hold egennavn like der det passer seg.
- Ikke oversett JSON feltene som kreves som en del av outputen.
- Vurder kandidatene kun basert på kvalifikasjonene sine.
- Sluttvurderingsscoren per kandidat skal baseres KUN på rubrikken.
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
