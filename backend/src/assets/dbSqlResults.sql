DROP TABLE results;

create table
    if not exists results (
        job_post_id int not null,
        candidate_id int not null,
        rank int not null,
        score float not null,
        qualified boolean not null,
        qualifications_met text[] not null,
        qualifications_missing text[] not null,
        course_recommendations text[] not null,
        unknowns text[] not null,
        summary text,
        primary key (job_post_id, candidate_id),
        foreign key (job_post_id) references job_posts (id) on delete cascade,
        foreign key (candidate_id) references candidates (id) on delete cascade,
        created_at timestamptz default now ()
    );

INSERT INTO
    results (job_post_id, candidate_id, rank, score, qualified, qualifications_met, qualifications_missing, course_recommendations, unknowns, summary)
VALUES
    (1, 1, 1, 95.5, true, ARRAY['Bachelor i informatikk', 'Lang erfaring med JavaScript', 'God teknisk bredde'], ARRAY['Lite dokumentert ledererfaring'], ARRAY['React erfaring', 'Teamledelse erfaring'], ARRAY[]::text[], 'Sterk kandidat med relevant erfaring.'),
    (1, 2, 2, 85.0, false, ARRAY['Bachelor i informatikk', 'Erfaring med frontend'], ARRAY['For lite JavaScript-erfaring', 'Manglende seniorprofil', 'Lite dokumentert ansvar'], ARRAY[]::text[], ARRAY[]::text[], 'Har noe relevant bakgrunn, men mangler tyngde.'),
    (2, 1, 2, 88.0, true, ARRAY['Bachelor i informatikk', 'Erfaring med Python', 'Vant til analysearbeid'], ARRAY['Lite dokumentert SQL-optimalisering'], ARRAY['SQL erfaring'], ARRAY['erfaring med cobol'], 'Oppfyller kravene og virker stabil.'),
    (2, 2, 1, 92.0, true, ARRAY['Bachelor i informatikk', 'Solid Python-erfaring', 'Relevant analyseerfaring'], ARRAY['Begrenset domeneerfaring', 'Uklart nivå på visualisering'], ARRAY['SQL erfaring'], ARRAY[]::text[], 'Svært god match for stillingen.');