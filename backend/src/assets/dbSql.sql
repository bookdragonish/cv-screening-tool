DROP TABLE IF EXISTS results CASCADE;
DROP TABLE IF EXISTS job_posts CASCADE;
DROP TABLE candidates CASCADE;

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
        hardQualifications text,
        softQualifications text,
        created_at timestamptz default now ()
    );