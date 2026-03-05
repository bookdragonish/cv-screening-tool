## Endringer i Gemini-prompts

Når du endrer Gemini-prompts, er det ett spørsmål som er viktig først:

**Endrer du bare hvordan modellen skal oppføre seg, eller endrer du selve JSON-strukturen den skal returnere?**

### Endringer i oppførsel

Hvis du bare justerer formuleringer, regler eller stil, holder det som regel å endre promptene.

Typiske eksempler:
- "Skriv på norsk"
- "Ta med firmanavn i stillingstittelen"
- "Vær strengere på det som er uklart eller mangler"
- "Ikke gi poeng for ting som ikke er eksplisitt dokumentert"

Slike endringer krever som regel **ikke** endringer andre steder i koden, så lenge Gemini fortsatt returnerer samme JSON-felter med samme navn og type.

### Endringer i JSON-outputen som vi får fra Gemini

Hvis du endrer strukturen på JSON-en Gemini returnerer, må du som regel oppdatere flere steder i koden.

Det gjelder for eksempel hvis du:
- fjerner et felt
- gir et felt nytt navn
- legger til et nytt obligatorisk felt
- endrer typen på et felt

Da bør du gå gjennom dette:

1. Prompten
   JSON-eksempelet i prompten må oppdateres.

2. Zod-schema
   Fil: `frontend/src/api/gemini/lib/schemas.ts`

3. TypeScript-typer
   Fil: `frontend/src/api/gemini/lib/types.ts`

4. Kode som bruker responsen
   Typisk: `frontend/src/components/newScreening/newScreeningLib/runScreeningWithGemini.ts`

5. Eventuelle komponenter eller sider som viser dataene
   Dette avhenger av hvilket felt du har endret.

### Eksempel: Fjerne `role_title`

Hvis du fjerner `role_title` fra jobprofilen, må du sannsynligvis oppdatere:

- JSON-eksempelet i prompten
- `JobProfile` i `types.ts`
- `JobProfileSchema` i `schemas.ts`
- all kode som bruker `jobProfile.role_title`
- logikken som setter jobbtittel i screeningflyten og resultatvisningene

### Eksempel: Gi `must_haves` nytt navn

Hvis du bytter `must_haves` til `requirements`, må du oppdatere:

- JSON-eksempelet i prompten
- `JobProfile` i `types.ts`
- `JobProfileSchema` i `schemas.ts`
- alle steder som bruker `jobProfile.must_haves`
- eventuell logikk som bygger opp kravlister eller lagrer screeningdata

### Enkel sjekkliste

Hvis du bare har endret oppførsel:
- oppdater prompten
- kjør en manuell test
- sjekk at Gemini fortsatt returnerer gyldig JSON i samme format

Hvis du har endret JSON-strukturen:
- oppdater JSON-eksempelet i prompten
- oppdater `types.ts`
- oppdater `schemas.ts`
- oppdater kode som parser eller mapper responsen
- oppdater eventuell UI som bruker feltet

### Kort sagt

Prompten bestemmer hva Gemini **skal** returnere.
Schemaet bestemmer hva appen **godtar**.
Typene bestemmer hva koden **forventer**.
Resten av koden bestemmer hvordan dataene **brukes**.
