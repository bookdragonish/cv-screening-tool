DROP TABLE IF EXISTS results CASCADE;

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