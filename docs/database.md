# How to PostgreSQL

This guide explains how to set up **PostgreSQL** locally so you can run the backend and test it with Postman.

## Overview
- [Installation](#installation)
- [Setup database](#setup-database)
    - [Create a cv_database](#create-a-cv_database)
    - [Create limited user](#create-limited-user)
    - [Update .env](#update-env)
    - [Add info](#add-info)
    - [Reset test data](#reset-test-data)
- [Test that it is running](#how-to-test-that-it-is-running)
    - [Postman](#postman-optional)
    - [Client password must be a string](#client-password-must-be-a-string)
- [Notes to my future self](#notes-to-my-future-self)

## How to run
Once the db is set up on your machine you can run it using ```npm run dev``` in backend folder


## Installation
- [Link to PostgreSQL](https://www.postgresql.org/)
    - Install both PostgreSQL and (optional) pgAdmin.
    - pgAdmin is the interface to manage the db. This is an option you need to choose if you want it after downloading and **before** clicking install PostgreSQL.
    - When installing you will set a password for the db **remember this**.

## Setup database
I will assume you have the pgAdmin interface from this point on, if you prefer to work in the terminal, wo ho to you, but I cannot help you.

### Create a cv_database:
In pgAdmin, open in the sidebar: Servers -> PostgreSQL 18 -> Databases

Right click on databases and choose create. This need no spesifications (I think???), but set the name to cv_database (you can choose something else but then you cannot mindlessly copy paste later).

### Create limited user:
We have a user called postgres, however this is similar to writing "sudo", we would like a user with a bit more limited access.

In the pgAdmin cv_database choose Query Tool the top tab named "cv_database/postgres@PostgreSQL 18". Here you can write sql. **Change password before creating new user**. 
```
CREATE USER cv_app_user WITH PASSWORD 'strongpassword';
GRANT CONNECT ON DATABASE cv_database TO cv_app_user;
```
Give schema permissions for now and future
```
GRANT USAGE ON SCHEMA public TO cv_app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO cv_app_user;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO cv_app_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO cv_app_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO cv_app_user;

```
### Update .env
Change password to the one you created when setting up the database. if you changed DB name or user name, this is the place to update it.
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=cv_app_user
DB_PASSWORD=your_password
DB_NAME=cv_database
```

### Add info:

The same place we ran the create user (in pgAdmin) we will now run SQL.

```
create table if not exists candidates (
  id serial primary key,
  name text not null,
  email text not null unique,
  created_at timestamptz default now()
);

create table if not exists job_posts (
  id serial primary key,
  header text not null
  title text not null,
  description text not null,
  hardQualifications text,
  softQualifications text,
  created_at timestamptz default now()
);

INSERT INTO candidates (name, email)
VALUES 
  ('Alice Johnson', 'alice.johnson@example.com'),
  ('Mark Chen', 'mark.chen@example.com');

INSERT INTO job_posts(header, title, description, hardQualifications, softQualifications)
VALUES 
  ('Do you want to be our new contract manager?', 'Contract manager', 'Responsible for enforcing and updating the rules of the group contract', 'minimum 10 years experience with vinstraff.no, saved children from a burning hospital, must work at nasa', 'good at giving vinstraffer, fair, cool'),
('Do you want to be our new meeting coordinator?', 'Meeting coordinator', 'Responsible booking rooms and reminding the group of meetings', 'must be named Marius, must have drivers licence', 'should know ball, should be able to book rooms');

```
To check if they were added:
```
SELECT * FROM candidates;

or:

SELECT * FROM job_posts;
```

### Reset test data
In the future, if you need to reset test data:
```TRUNCATE candidates RESTART IDENTITY;```


## How to test that it is running

```npm run dev``` in the backend folder then

### Postman (optional)
[Postman](https://www.postman.com/) is a great tool for api testing, it is not needed but if you'd like more experience with backend or need to setup api request later, this is a good tool.

If you have not used it before it has a simple interface:
![alt text](/public/images/screenshot_postman.png)
Here you can define if you like to get, post or whatever to the database link. You can also spesify params (do you want a certain ID or so on). 

Basically it checks that the database is up and you get the response that you want. You can also check this using the code we write, however if there is issues with the code, it might be difficult to know if the cause is frontend or backend.

This also gives better error codes.

### Paste the link in a browser
If you have followed the guide correctly, the links you can write is:


Idk if this doesnt run something ain't right| http://localhost:3000/health

Check if the db is running | http://localhost:3000/db-check

Check that you can get the info | http://localhost:3000/api/candidates

The last one should return:

![screenshot of data](/public/images/database_images.png)


## Known issues

### I do not know if my db is running...?
1. Press Win + R
2. Type: services.msc → Enter
3. Find a service named something like: postgresql-x64-17 (version number may differ)
4. Status should be Running. If not running: right-click → Start

If you have crapple I dont care. Also if you have pgAdmin open..it is running.

### /health runs but not /db-check
Your db is setup wrong. Double check:
- Do you have a user?
- Is the username set in the .env
- Check that the ```SELECT * FROM candidates;``` command runs

### Client password must be a string
You do not have a user. And if you do the username is set wrong so the system sees the password as undefined.


## Notes to my future self
When moving on to using one hosted db this is the code for separate login roles:

``` 
CREATE ROLE ingvi WITH LOGIN PASSWORD 'StrongPassword1!';
GRANT CONNECT ON DATABASE cv_database TO ingvi;
GRANT USAGE ON SCHEMA public TO ingvi;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ingvi;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO ingvi;
```

