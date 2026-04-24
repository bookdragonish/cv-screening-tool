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
    hardQualifications,
    softQualifications
) VALUES (
    1,
    'Vernepleier - Trondheim kommune',
    'Vernepleier - Trondheim kommune',
    'Analysert fra opplastet PDF: Vernepleier.pdf',
    ARRAY[
        'Bachelor i vernepleie',
        'Flytende norsk, både muntlig og skriftlig'
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
    1,
    4,
    78,
    true,
    ARRAY['Vernepleier', 'Miljøarbeid', 'Autisme erfaring']::text[],
    ARRAY['Lang erfaring']::text[],
    ARRAY['Videregående kurs i atferdshåndtering']::text[],
    ARRAY['Ledererfaring']::text[],
    'Solid kandidat med relevant erfaring, men noe begrenset ansiennitet.'
),
(
    1,
    2,
    2,
    88,
    true,
    ARRAY['Vernepleier', 'Primærkontakt', 'Tiltaksplaner', 'Autisme erfaring']::text[],
    ARRAY['Lang erfaring']::text[],
    ARRAY['Avansert miljøterapi kurs']::text[],
    ARRAY['Formell lederrolle']::text[],
    'Sterk kandidat med god erfaring og bred kompetanse.'
),
(
    1,
    3,
    5,
    65,
    false,
    ARRAY['Helsefaglig bakgrunn']::text[],
    ARRAY['Vernepleier', 'Miljøarbeid erfaring', 'Autisme erfaring']::text[],
    ARRAY['Miljøarbeid grunnkurs', 'Autisme kurs']::text[],
    ARRAY['Reell erfaring med målgruppen']::text[],
    'Relevant helsefaglig bakgrunn, men mangler kjernekompetanse.'
),
(
    1,
    4,
    1,
    97,
    true,
    ARRAY['Vernepleier', '20+ års erfaring', 'Ledelse', 'Tiltaksplaner', 'Autisme ekspertise']::text[],
    ARRAY[]::text[],
    ARRAY[]::text[],
    ARRAY[]::text[],
    'Svært sterk senior kandidat med omfattende erfaring og faglig tyngde.'
),
(
    1,
    5,
    3,
    83,
    true,
    ARRAY['Vernepleier', 'Primærkontakt', 'Miljøarbeid', 'Autisme erfaring']::text[],
    ARRAY['Lang erfaring']::text[],
    ARRAY['Videregående fagkurs']::text[],
    ARRAY['Spesialisering']::text[],
    'God kandidat med relevant erfaring og potensial for videre utvikling.'
);