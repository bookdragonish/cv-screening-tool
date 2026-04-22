# CV screening tools

Developed in collaboration with Trondheim Kommune.

## 🔎 Navigation
Currently, two official plugins are:

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#-project-structure)
- [Installation and Setup](#installation-and-setup)
- [Database](#database-setup)
- [Endpoints](#endpoints)
- [AI models](#ai-models)
- [Security Considerations](#security-considerations)
- [Testing](#testing)
- [Collaborators](#collaborators)

## 🚀 Features

- Upload and store candidate CVs (PDF format)
- Store CVs securely in PostgreSQL (BYTEA)
- Extract and process CV content
- AI-based evaluation against job descriptions
- Candidate overview dashboard
- REST API for candidate management
- File size and type validation
- Error handling and loading states in UI

## Tech Stack

### Frontend

- React (Vite)
- TypeScript
- Tailwind CSS
- shadcn/ui

### Backend

- Node.js
- Express
- TypeScript
- Multer (file upload handling)
- Pdf-parse

### Database

- PostgreSQL

### AI Integration

- Gemeni or
- NorLLM

### Testing

- Playwright
- Vitest

---

## 📁 Project Structure

```
CV-SCREENING-TOOL/
├── api/
├── backend/
│   ├── src/
│   │   ├── assets/
│   │   ├── controllers/
│   │   ├── db/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── server.ts
│   └── .env
│
├── docs/
│
├── frontend/
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── validation/
│   │   └── main.tsx
│   └── index.html
```

---

## ⚙️ Installation and Setup

### Clone Repository

```bash
git clone https://github.com/your-username/cv-screening-tool.git
cd cv-screening-tool
```

### Backend setup
Per now the backend is not hosted and needs to be running locally for this application. See [the section on database setup](#database-setup) for more info.

After having completed the setup, open a terminal and run:

```bash
cd backend
npm install
```


#### .env file in /backend

Then add .env to the backend folder with info:

```
DB_HOST="localhost"
DB_PORT="5432"
DB_USER=""
DB_PASSWORD=""
DB_NAME="cv_database"
FRONTEND_HOSTED_LINK="http://localhost:5173"
LLM="gemini" #either gemini or norllm
GEMINI_API_KEY=""
NORLLM_KEY=""
```

#### Run the backend
To run the backend, open a terminal and run these commands.


#### backend start

```bash
npm run dev
```

After this open the link: http://localhost:3000

### Frontend setup

In another terminal run:

```bash
cd frontend
npm install
npm run dev
```

This should open our application on: http://localhost:5173

## Database setup

Our database is PostgreSQL, follow [their guide](https://www.postgresql.org/) to download the database. Then run the sql scripts in the /assets folder in backend. This configures the tables correctly.

For more installation documents on the database see the [database.md file](./docs/database.md)

### Endpoints

#### Candidates:

| Description         | Endpoint                | Body                |
| ------------------- | ----------------------- |--------------------|
| Get all candidates  | GET /api/candidates     |                  |
| Get candidate by ID | GET /api/candidates/:id ||
| Create candidate    | POST /api/candidates    |Content-Type: application/json { "name": "John Doe", "email": "john@examplecom"}|
|Upload CV | POST /api/candidates/:id/cv | Content-Type: multipart/form-data FormData: cv: <PDF file>


## AI models

## Security Considerations

- File upload size limit (10MB)
- Only PDF file types accepted
- Environment variables for sensitive keys
- CORS configuration on backend
- No production credentials committed to repository
- Designed for test data during development

## Testing

Not yet implemented unittests and E2E tests.

## Collaborators

- Helene Selvig
- Marius Brun 
- Markus Watle
- Mohammad Kazem Khajeh 
- Marius Fornes
- Baris Batur
- Ingvild Kirkaune Sandven