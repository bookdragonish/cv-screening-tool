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
        summary text,
        primary key (job_post_id, candidate_id),
        foreign key (job_post_id) references job_posts (id) on delete cascade,
        foreign key (candidate_id) references candidates (id) on delete cascade,
        created_at timestamptz default now ()
    );

INSERT INTO
    results (job_post_id, candidate_id, rank, score, qualified, qualifications_met, qualifications_missing, summary)
VALUES
    (1, 1, 1, 95.5, true, ARRAY['Bachelor''s degree in Computer Science', '5 years of experience with JavaScript'], ARRAY[]::text[], 'Alice is a strong candidate with relevant experience and qualifications.'),
    (1, 2, 2, 85.0, false, ARRAY['Bachelor''s degree in Computer Science'], ARRAY['5 years of experience with JavaScript'], 'Mark has the necessary education but lacks the required experience with JavaScript.'),
    (2, 1, 2, 88.0, true, ARRAY['Bachelor''s degree in Computer Science', '3 years of experience with Python'], ARRAY[]::text[], 'Alice meets the qualifications for the data analyst position.'),
    (2, 2, 1, 92.0, true, ARRAY['Bachelor''s degree in Computer Science', '4 years of experience with Python'], ARRAY[]::text[], 'Mark is a strong candidate for the data analyst position with relevant experience.');