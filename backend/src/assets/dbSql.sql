DROP TABLE candidates; 

create table
    if not exists candidates (
        id serial primary key,
        name text not null,
        email TEXT unique,
        cv_pdf BYTEA,
        cv_markdown text,
        created_at timestamptz default now ()
    );

INSERT INTO
    candidates (name, email)
VALUES
    ('Alice Johnson', 'alice.johnson@example.com'),
    ('Mark Chen', 'mark.chen@example.com');