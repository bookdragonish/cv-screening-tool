DROP TABLE IF EXISTS results CASCADE;
DROP TABLE IF EXISTS job_posts CASCADE;
DROP TABLE IF EXISTS candidates CASCADE;

create table
    if not exists candidates (
        id serial primary key,
        name text not null,
        email TEXT unique,
        cv_pdf BYTEA,
        cv_markdown text,
        aml46 boolean not null default false,
        aml47 boolean not null default false,
        ansiennitet integer[],
        constraint chk_aml_one_at_a_time check (not (aml46 = true and aml47 = true)),
        created_at timestamptz default now ()
    );

create table
    if not exists job_posts (
        id serial primary key,
        header text not null,
        title text not null,
        description text not null,
        must_have_qualifications text[],
        nice_to_have_qualifications text[],
        created_at timestamptz default now ()
    );

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