## Hvordan contexten i ny screening fungerer

Siden for ny screening består ikke av én enkelt side, men av en liten flyt med flere undersider:

- opplasting / input
- behandling
- resultater
- kandidatvisning

Disse sidene trenger tilgang til noe av den samme tilstanden underveis. Derfor brukes en felles context for hele denne delen av løsningen.

### Hvor contexten ligger

Contexten for denne flyten er fordelt på to steder:

- `frontend/src/components/newScreening/newScreeningLib/screeningContext.ts`
- `frontend/src/pages/newScreening/ScreeningFlowPage.tsx`

`screeningContext.ts` beskriver hvilke verdier og settere som finnes i contexten.

`ScreeningFlowPage.tsx` er stedet der disse verdiene faktisk opprettes med `useState(...)` og sendes videre i `Outlet context={...}`.

De andre sidene i flyten henter så ut dette med `useScreeningOutlet()`.

### Hvordan flyten henger sammen

`ScreeningFlowPage.tsx` er foreldreruten for hele screeningflyten. Den holder på delt state som flere undersider trenger, for eksempel:

- hvilken del av flyten brukeren er i
- valgt jobbeskrivelse
- jobbtittel
- kandidatresultater
- påkrevde ferdigheter
- analysetidspunkt

Denne staten blir lagt i `contextValue`, og alle undersider under denne ruten kan lese og oppdatere den.

Det betyr at:

- `NewScreeningPage.tsx` kan starte en screening og lagre resultatene i contexten
- `ScreeningResultsPage.tsx` kan lese kandidatene og vise resultatlisten
- `ScreeningCandidatePage.tsx` kan lese samme data og vise detaljvisning for én kandidat

Poenget er at man slipper å sende props gjennom flere nivåer, og man slipper å hente samme data på nytt når brukeren beveger seg mellom delene av flyten.

## Når du må endre contexten

Du må endre contexten når du innfører ny delt state som flere sider i screeningflyten trenger.

Det gjelder typisk når en verdi:

- skal opprettes ett sted
- brukes flere andre steder
- må leve videre mens brukeren navigerer mellom undersidene

Da må du som regel oppdatere to steder:

1. `screeningContext.ts`
   Legg til feltet i `ScreeningOutletContext`

2. `ScreeningFlowPage.tsx`
   Opprett state med `useState(...)` og legg det inn i `contextValue`

I noen tilfeller må du også oppdatere siden som setter verdien, for eksempel `NewScreeningPage.tsx`.

### Typiske tilfeller der contexten må endres

#### 1. En ny verdi skal brukes både i resultatsiden og kandidatsiden

Eksempler:
- `jobPostId`
- `companyName`
- en lagret tittel fra Gemini
- en oppsummering av stillingsbeskrivelsen

Hvis både `ScreeningResultsPage.tsx` og `ScreeningCandidatePage.tsx` trenger verdien, er context ofte riktig sted.

#### 2. En verdi skal overleve navigasjon mellom undersidene

Hvis noe settes under behandling og skal brukes etterpå uten å hentes på nytt, bør det ligge i contexten.

#### 3. Flere komponenter i flyten trenger samme setter

Hvis flere steder skal kunne oppdatere den samme verdien, er det naturlig å ha både verdi og setter i contexten.

## Når du ikke trenger å endre contexten

Du trenger ikke endre contexten hvis endringen bare påvirker én komponent eller ett lokalt ansvar.

### Typiske tilfeller der contexten ikke trenger å endres

#### 1. Du endrer bare utseende eller tekst i én komponent

Eksempler:
- ny overskrift
- annen knappetekst
- justering av layout
- ikonendringer

Da holder det som regel å endre komponenten direkte.

#### 2. Du endrer Gemini-prompts uten å innføre ny delt state

Eksempler:
- Gemini skal skrive på norsk
- Gemini skal være strengere
- Gemini skal ta med firmanavn i tittelen

Så lenge den eksisterende mappingen og de eksisterende feltene fortsatt er nok, trenger du vanligvis ikke røre contexten.

#### 3. Du endrer intern logikk i én side uten at andre sider trenger resultatet

Hvis verdien bare brukes lokalt på én side, er lokal state eller ren beregning ofte bedre enn å legge den i context.

## Et konkret eksempel

Da jobbtittelen fra Gemini skulle brukes i resultatvisningene, holdt det ikke lenger å lese tittelen direkte fra `jobDescriptionInput`.

Tidligere ble tittelen regnet ut fra:
- filnavn ved PDF
- en fast standardtekst ved innlimt tekst

Det fungerte for PDF, men ikke for tekst der Gemini faktisk hadde hentet ut en bedre tittel.

Løsningen var da å:
- legge en egen jobbtittelverdi i contexten
- sette den når screeningen var ferdig
- lese den i resultat- og kandidatsiden

Dette er et typisk eksempel på en endring som faktisk krever oppdatering av contexten.

## Hvor du vanligvis gjør endringer

### `screeningContext.ts`

Brukes når du må utvide eller endre selve kontrakten for contexten.

Her legger du til:
- nye verdier
- nye settere
- eventuelt nye typer

### `ScreeningFlowPage.tsx`

Brukes når du må opprette ny delt state og sende den inn i contexten.

Her legger du typisk til:
- `useState(...)`
- eventuelle avledede verdier
- felt i `contextValue`

### `NewScreeningPage.tsx`

Brukes ofte når nye verdier skal settes etter at Gemini har kjørt ferdig.

Eksempler:
- lagre kandidater
- lagre påkrevde ferdigheter
- lagre analysetidspunkt
- lagre jobbtittel

### `ScreeningResultsPage.tsx` og `ScreeningCandidatePage.tsx`

Brukes når du skal lese verdier fra contexten og vise dem.

## Oppsummert

Contexten i ny screening finnes for å holde på delt state gjennom hele screeningflyten.

Du trenger å endre den når:
- flere sider trenger samme nye verdi
- verdien må leve videre gjennom flyten
- en ny delt setter trengs

Du trenger ikke å endre den når:
- endringen bare gjelder én komponent
- du bare justerer tekst, stil eller layout
- promptene endres uten at det innføres ny delt state

Det viktigste er å ikke legge for mye i contexten uten grunn. Bruk den for delt flytstate, ikke for alt mulig.