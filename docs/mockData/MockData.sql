INSERT INTO candidates (id, name, email, cv_pdf, ansiennitet)
VALUES
(1, 'Gøran Haraldson', 'goeranh@gmail.com', NULL, ARRAY[2, 2, 0]),
(2, 'Ingrid Sandgren', 'ingrid.sandgren@gmail.com', NULL, ARRAY[5, 2, 1]),
(3, 'Kim Knudsen', 'kim.knudsen@gmail.com', NULL, ARRAY[4, 1, 0]),
(4, 'Ragnar Lindholm', 'ragnar.lindholm@gmail.com', NULL, ARRAY[14, 6, 2]),
(5, 'Selda Ingerman', 'selda.ingerman@gmail.com', NULL, ARRAY[4, 2, 1]);

INSERT INTO job_posts (
    id,
    header,
    title,
    description,
    must_have_qualifications,
    nice_to_have_qualifications
) VALUES (
    1,
    'Vernepleier - Trondheim kommune',
    'Vernepleier - Trondheim kommune',
    'Analysert fra opplastet PDF: Vernepleier.pdf',
    ARRAY[
        'Bachelor i vernepleie'
    ]::text[],
    ARRAY[
        'Relevant erfaring med det å bistå personer med utviklingshemning',
        'Relevant erfaring med det å bistå personer med autismespekterdiagnose',
        'Erfaring med målrettet miljøarbeid',
        'Erfaring med utfordrende adferd',
        'Erfaring fra det å samarbeid med pårørende',
        'Førerkort for vanlig bil',
        'Tegnspråkkompetanse',
        'Erfaring som primærkontakt eller tilsvarende ansvar'
    ]::text[]
);

INSERT INTO results (
    job_post_id,
    candidate_id,
    rank,
    score,
    qualified,
    qualifications_met,
    qualifications_missing,
    course_recommendations,
    unknowns,
    summary
)
VALUES
(
    1,
    4,
    1,
    100,
    true,
    ARRAY['Bachelor i vernepleie','Relevant erfaring med det å bistå personer med utviklingshemning','Relevant erfaring med det å bistå personer med autismespekterdiagnose','Erfaring med målrettet miljøarbeid','Erfaring med utfordrende adferd','Erfaring fra det å samarbeide med pårørende','Førerkort for vanlig bil','Flytende norsk, både muntlig og skriftlig','Tegnspråkkompetanse', 'Erfaring som primærkontakt eller tilsvarende ansvar']::text[],
    ARRAY[]::text[],
    ARRAY[]::text[],
    ARRAY[]::text[],
    'Ragnar Lindholm er en svært erfaren og autorisert vernepleier med over 20 års erfaring. Han oppfyller alle de absolutte og ønskede kravene, inkludert omfattende erfaring med personer med utviklingshemming og autismespekterdiagnoser, målrettet miljøarbeid, håndtering av utfordrende atferd, og samarbeid med pårørende. Han har lang erfaring som primærkontakt, førerkort klasse B, flytende norsk og grunnleggende tegnspråkkompetanse.'
),
(
    1,
    2,
    1,
    100,
    true,
    ARRAY['Bachelor i vernepleie','Relevant erfaring med det å bistå personer med utviklingshemning','Relevant erfaring med det å bistå personer med autismespekterdiagnose','Erfaring med målrettet miljøarbeid','Erfaring med utfordrende adferd','Erfaring fra det å samarbeide med pårørende','Førerkort for vanlig bil','Flytende norsk, både muntlig og skriftlig','Tegnspråkkompetanse', 'Erfaring som primærkontakt eller tilsvarende ansvar']::text[],
    ARRAY[]::text[],
    ARRAY[]::text[],
    ARRAY[]::text[],
    'Ingrid Sandgren er en autorisert vernepleier med bachelorgrad og solid erfaring fra arbeid med personer med utviklingshemming og autismespekterdiagnoser. Hun oppfyller alle de absolutte og ønskede kravene, inkludert kompetanse innen målrettet miljøarbeid, trygg håndtering av utfordrende atferd, og omfattende samarbeid med pårørende. Hun har erfaring som primærkontakt, førerkort klasse B, flytende norsk og grunnleggende tegnspråkkompetanse.'
),
(
    1,
    5,
    3,
    80,
    true,
    ARRAY['Bachelor i vernepleie','Relevant erfaring med det å bistå personer med utviklingshemning','Relevant erfaring med det å bistå personer med autismespekterdiagnose','Erfaring med målrettet miljøarbeid','Erfaring med utfordrende adferd','Erfaring fra det å samarbeide med pårørende','Flytende norsk, både muntlig og skriftlig','Erfaring som primærkontakt eller tilsvarende ansvar']::text[],
    ARRAY['Tegnspråkkompetanse']::text[],
    ARRAY[]::text[],
    ARRAY['Førerkort for vanlig bil']::text[],
    'Selda Ingerman er en vernepleier med bachelorgrad og solid erfaring fra arbeid med personer med utviklingshemming og autismespekterdiagnoser. Hun har erfaring med målrettet miljøarbeid, håndtering av utfordrende atferd, og samarbeid med pårørende, samt erfaring som primærkontakt. Hun behersker norsk flytende. Det er uklart om hun har førerkort for vanlig bil, og hun mangler dokumentert tegnspråkkompetanse.'
),
(
    1,
    1,
    3,
    80,
    true,
    ARRAY['Bachelor i vernepleie','Relevant erfaring med det å bistå personer med utviklingshemning','Relevant erfaring med det å bistå personer med autismespekterdiagnose','Erfaring med målrettet miljøarbeid','Erfaring med utfordrende adferd','Erfaring fra det å samarbeide med pårørende','Førerkort for vanlig bil','Flytende norsk, både muntlig og skriftlig','Tegnspråkkompetanse', 'Erfaring som primærkontakt eller tilsvarende ansvar']::text[],
    ARRAY['Erfaring fra det å samarbeide med pårørende','Erfaring som primærkontakt eller tilsvarende ansvar']::text[],
    ARRAY[]::text[],
    ARRAY[]::text[],
    'Gøran Haraldson er en autorisert vernepleier med bachelorgrad og erfaring fra arbeid med personer med utviklingshemming og autismespekterdiagnoser. Han har kompetanse innen målrettet miljøarbeid og erfaring med håndtering av utfordrende atferd. Han har førerkort klasse B, behersker norsk flytende og har grunnleggende tegnspråkkompetanse. Det er uklart om han har spesifikk erfaring med samarbeid med pårørende eller som primærkontakt.'
),
(
    1,
    3,
    3,
    60,
    false,
    ARRAY['Relevant erfaring med det å bistå personer med utviklingshemning','Erfaring med målrettet miljøarbeid','Erfaring med utfordrende adferd','Erfaring fra det å samarbeide med pårørende','Førerkort for vanlig bil','Flytende norsk, både muntlig og skriftlig']::text[],
    ARRAY['Bachelor i vernepleie','Relevant erfaring med det å bistå personer med autismespekterdiagnose','Tegnspråkkompetanse','Erfaring som primærkontakt eller tilsvarende ansvar']::text[],
    ARRAY['Videregående fagkurs']::text[],
    ARRAY[]::text[],
    'Kim Knudsen er en sykepleier med noe erfaring fra miljøarbeid og bistand til personer med utviklingshemming. Han har grunnleggende erfaring med målrettet miljøarbeid og håndtering av utfordrende atferd, samt erfaring med pårørende. Han har førerkort klasse B og behersker norsk flytende. Kandidaten mangler den etterspurte bachelorgraden i vernepleie, og det er uklart om han har erfaring med autismespekterdiagnoser eller som primærkontakt. Han har heller ikke dokumentert tegnspråkkompetanse.'
);