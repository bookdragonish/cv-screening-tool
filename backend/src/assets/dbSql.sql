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
        ansiennitet integer check (ansiennitet >= 0 and ansiennitet <= 100),
        constraint chk_aml_one_at_a_time check (not (aml46 = true and aml47 = true)),
        created_at timestamptz default now ()
    );

create table
    if not exists job_posts (
        id serial primary key,
        header text not null,
        title text not null,
        description text not null,
        hardQualifications text[],
        softQualifications text[],
        created_at timestamptz default now ()
    );

INSERT INTO
    candidates (name, email)
VALUES
    ('Alice Johnson', 'alice.johnson@example.com'),
    ('Mark Chen', 'mark.chen@example.com');

INSERT INTO
    job_posts (
        header,
        title,
        description,
        hardQualifications,
        softQualifications
    )
VALUES
    (
        'Do you want to be our new contract manager?',
        'Contract manager',
        'Responsible for enforcing and updating the rules of the group contract',
          ARRAY['minimum 10 years experience with vinstraff.no', 'saved children from a burning hospital', 'must work at nasa'],
          ARRAY['good at giving vinstraffer', 'fair', 'cool']
    ),
    (
        'Do you want to be our new meeting coordinator?',
        'Meeting coordinator',
        'Responsible booking rooms and reminding the group of meetings',
        ARRAY['must be named Marius', 'must have drivers licence'],
        ARRAY['should know ball', 'should be able to book rooms']
    );