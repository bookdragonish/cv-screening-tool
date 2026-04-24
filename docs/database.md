# PostgreSQL Setup Guide

This guide describes how to install and configure **PostgreSQL** locally in order to run the backend.

---

## Overview

- [Installation](#installation)
- [Database Setup](#database-setup)
  - [Create Database](#create-database)
  - [Create Limited User](#create-limited-user)
  - [Update Environment Variables](#update-environment-variables)
  - [Add Data](#add-data)
- [Running the Application](#running-the-application)
- [Verification](#verification)
  - [Using Postman (Optional)](#using-postman-optional)
  - [Using Browser Endpoints](#using-browser-endpoints)
- [Known Issues](#known-issues)

---

## Installation

Download PostgreSQL from the official website:  
https://www.postgresql.org/

During installation:
- Install both **PostgreSQL** and (optionally) **pgAdmin**
- pgAdmin provides a graphical interface for database management
- Set a password for the default `postgres` user and store it securely

---

## Database Setup

The following steps assume usage of **pgAdmin**. If you prefer using the terminal, equivalent commands may be executed there.

### Create Database

In pgAdmin:
- Navigate to: `Servers → PostgreSQL → Databases`
- Right-click **Databases** → **Create → Database**
- Name the database: cv_database

> You may choose another name, but you must then update all references accordingly.

---

### Create Limited User

The default `postgres` user has full administrative privileges. It is recommended to create a more restricted user for application access.

Open the **Query Tool** for `cv_database` and execute:

```sql
CREATE USER cv_app_user WITH PASSWORD 'strongpassword';
GRANT CONNECT ON DATABASE cv_database TO cv_app_user;
```

Grant schema and table permissions:
```sql
GRANT USAGE ON SCHEMA public TO cv_app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO cv_app_user;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO cv_app_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO cv_app_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO cv_app_user;
```
### Update Environment Variables

Update your `.env` file to reflect your database configuration:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=cv_app_user
DB_PASSWORD=your_password
DB_NAME=cv_database
```

Ensure that:
- The password matches the one defined during user creation
- Any custom database or user names are updated accordingly

### Add Data

Run the sql code in the 
```backend/assets/dbSql.sql```
For setting up mock data run the
```docs/mockData/MockData.sql```

### Running the Application

Once PostgreSQL is installed and configured, start the backend:

```
npm run dev
```
Run this command from the backend directory.

## Verification

### Using Postman (Optional)

[Postman](https://www.postman.com/) is a widely used tool for testing API endpoints. While optional, it is highly recommended for development and debugging.

Postman allows you to:
- Send HTTP requests (e.g., GET, POST, PUT, DELETE)
- Inspect response bodies, status codes, and headers
- Test endpoints independently of the frontend
- Identify whether issues originate from the backend or frontend

#### Basic Usage

1. Open Postman
2. Select the request method (e.g., `GET`)
3. Enter the request URL (e.g., `http://localhost:3000/api/candidates`)
4. Click **Send**
5. Inspect the response in the lower panel

You may also:
- Add query parameters
- Include request bodies (for POST/PUT)
- Set headers (e.g., `Content-Type`)

Using Postman helps isolate and diagnose backend issues more efficiently, especially when frontend behavior is uncertain.

### Using Browser Endpoints

You can also verify the system directly through your browser by accessing the following endpoints:

- **Health check**  
  http://localhost:3000/health  
  Confirms that the backend service is running.

- **Database connection check**  
  http://localhost:3000/db-check  
  Verifies that the backend can successfully connect to the database.

- **Retrieve candidate data**  
  http://localhost:3000/api/candidates  
  Returns stored candidate data. If mock data has been added, this endpoint should return a populated response.


| Description         | Endpoint                | Body                |
| ------------------- | ----------------------- |--------------------|
| Get all candidates  | GET /api/candidates     |                  |
| Get candidate by ID | GET /api/candidates/:id ||
| Create candidate    | POST /api/candidates    |Content-Type: application/json { "name": "John Doe", "email": "john@examplecom"}|
|Upload CV | POST /api/candidates/:id/cv | Content-Type: multipart/form-data FormData: cv: <PDF file>


---

## Known Issues

### Database Not Running

On Windows systems:

1. Press `Win + R`
2. Enter `services.msc` and press Enter
3. Locate a service named similar to `postgresql-x64-XX` (version number may vary)
4. Ensure the status is **Running**
   - If not, right-click and select **Start**

If pgAdmin is open and connected, the database is typically running.

---

### `/health` Responds but `/db-check` Fails

This usually indicates a database configuration issue. Verify the following:

- The database user has been created
- Credentials in the `.env` file are correct
- The database is accessible

Additionally, confirm that the following query executes successfully:

```sql
SELECT * FROM candidates;

```

### Error: "Client password must be a string"

This error typically occurs when:

- The database user has not been created, or
- The username is incorrect, causing the password to be undefined

Ensure that:

- The user exists in PostgreSQL
- The .env configuration matches the defined credentials