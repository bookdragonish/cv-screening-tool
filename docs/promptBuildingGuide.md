## Endringer i Gemini-prompts

Når du endrer Gemini-prompts, start med dette spørsmålet:

**Endrer du bare hvordan modellen svarer, eller endrer du JSON-strukturen den returnerer?**

## 1) Hvis du bare endrer oppførsel

Dette er endringer som:
- språk/stil
- strenghet i vurdering
- hvordan modellen prioriterer informasjon
- små justeringer i formuleringer

Da holder det som regel å oppdatere promptfilene:
- `backend/src/services/llm/gemini/prompts/buildJobProfilePrompt.ts`
- `backend/src/services/llm/gemini/prompts/buildCandidateEvalPrompt.ts`
- `backend/src/services/llm/gemini/prompts/buildRankingPrompt.ts`
- `backend/src/services/llm/gemini/prompts/rulesAndRubric.ts`

Så lenge JSON-feltene og typene er like, trenger du vanligvis ikke endre schema/typer.

## 2) Hvis du endrer JSON-strukturen

Dette gjelder når du:
- legger til et nytt felt
- fjerner et felt
- bytter feltnavn
- endrer datatype

Da må du oppdatere flere steder.

### To-do ved strukturendring

1. Oppdater prompten
- Oppdater JSON-eksempelet i riktig promptfil i `backend/src/services/llm/gemini/prompts/`.

2. Oppdater Zod-schema
- Fil: `backend/src/services/llm/gemini/schemas.ts`

3. Oppdater TypeScript-typer
- Fil: `backend/src/types/GeminiTypes.ts`

4. Oppdater backend-logikk som bruker feltene
- Fil: `backend/src/controllers/geminiScreening.controller.ts`
- Sjekk spesielt mapping, fallback-verdier og hvilke felt som sendes videre.

5. Oppdater API/persistens hvis payloaden endres
- Fil: `backend/src/controllers/results.controller.ts`
- Fil: `backend/src/assets/dbSqlResults.sql` (hvis DB-kolonner må endres)

6. Oppdater frontend hvis respons-/lagringsfelt er endret
- API-kall: `frontend/src/api/runScreeningWithGemini.ts` (kaller backend-endepunkt)
- Typer for visning: `frontend/src/types/newScreeningTypes.ts`
- Typer for lagring/historikk: `frontend/src/api/fetchScreenings.ts` og `frontend/src/types/screening.ts`

## Hvordan flyten er nå (viktig)

- Frontend kaller backend-endepunkt: `POST /api/results/screenings/run`
- Backend snakker med Gemini
- Frontend har ikke egen Gemini-key eller direkte Gemini-kall

Det betyr at prompt-, schema- og parsing-endringer først og fremst skal gjøres i backend.

## Enkel sjekkliste før du er ferdig

1. Kjør en manuell test med både:
- innlimt tekst
- opplastet PDF

2. Sjekk at Gemini fortsatt returnerer gyldig JSON.

3. Sjekk at resultatet vises riktig i UI.

4. Hvis felter er endret: sjekk at lagring til historikk fortsatt fungerer.

## Kort oppsummert

- Prompten bestemmer hva Gemini blir bedt om å returnere.
- Schemaet bestemmer hva backend godtar.
- Typene bestemmer hva koden forventer.
- Controlleren og resten av flyten bestemmer hvordan dataene brukes og sendes videre.
