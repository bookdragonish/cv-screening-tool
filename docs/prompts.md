## Changes to Gemini Prompts

When modifying Gemini prompts, begin by asking:

**Are you only changing how the model responds, or are you changing the JSON structure it returns?**

---

## 1. Changes to Model Behavior Only

These include adjustments such as:
- Language or tone
- Evaluation strictness
- Information prioritization
- Minor phrasing refinements

In these cases, it is typically sufficient to update the prompt files:

- `backend/src/services/llm/gemini/prompts/buildJobProfilePrompt.ts`
- `backend/src/services/llm/gemini/prompts/buildCandidateEvalPrompt.ts`
- `backend/src/services/llm/gemini/prompts/buildRankingPrompt.ts`
- `backend/src/services/llm/gemini/prompts/rulesAndRubric.ts`

As long as the JSON fields and data types remain unchanged, updates to schemas or types are usually not required.

---

## 2. Changes to JSON Structure

This applies when you:
- Add a new field
- Remove a field
- Rename a field
- Modify a data type

In such cases, multiple components must be updated.

### Required Steps for Structural Changes

1. **Update the Prompt**
   - Modify the JSON example in the relevant prompt file under:
     `backend/src/services/llm/gemini/prompts/`

2. **Update the Zod Schema**
   - File: `backend/src/services/llm/gemini/schemas.ts`

3. **Update TypeScript Types**
   - File: `backend/src/types/GeminiTypes.ts`

4. **Update Backend Logic Using the Fields**
   - File: `backend/src/controllers/geminiScreening.controller.ts`
   - Pay particular attention to field mappings, fallback values, and downstream usage.

5. **Update API and Persistence if the Payload Changes**
   - File: `backend/src/controllers/results.controller.ts`
   - File: `backend/src/assets/dbSqlResults.sql` (if database columns require modification)

6. **Update Frontend if Response or Stored Fields Change**
   - API call: `frontend/src/api/runScreeningWithGemini.ts`
   - Display types: `frontend/src/types/newScreeningTypes.ts`
   - Storage/history types:
     - `frontend/src/api/fetchScreenings.ts`
     - `frontend/src/types/screening.ts`

---

## Current Flow (Important)

- The frontend calls the backend endpoint: `POST /api/results/screenings/run`
- The backend communicates with Gemini
- The frontend does not have a Gemini API key or direct access to Gemini

**Implication:** Prompt, schema, and parsing changes should primarily be implemented in the backend.

---

## Final Checklist

Before completing your changes:

1. Perform manual testing using:
   - Pasted text input
   - Uploaded PDF input

2. Verify that Gemini still returns valid JSON.

3. Confirm that results are correctly displayed in the UI.

4. If fields were modified, ensure that persistence and history storage still function correctly.

---

## Summary

- The **prompt** defines what Gemini is instructed to return.
- The **schema** defines what the backend accepts.
- The **types** define what the code expects.
- The **controllers and system flow** determine how data is processed and propagated.