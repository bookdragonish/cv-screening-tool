DROP TABLE course_rec;

create table
    if not exists course_rec (
        course_rec_id int not null,
        candidate_id int not null,
        qualifications_missing text[] not null,
        summary text,
        preffered_field text[],
        primary key (course_rec_id),
        foreign key (candidate_id) references candidates (id) on delete cascade,
        created_at timestamptz default now ()
    );