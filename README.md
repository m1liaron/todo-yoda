# Full Stack Todo Application

A full-stack Todo application built with **Next.js** and **FastAPI**. The project provides user authentication, task management, filtering, sorting, and pagination, with PostgreSQL used as the database.

## Features

### Authentication

- User registration
- User login
- JWT authentication
- Protected API endpoints

### Tasks

- Create tasks
- Update tasks
- Delete tasks
- Mark tasks as completed
- Assign priorities (1–10)
- Filter by completion status
- Sort by task fields
- Pagination
- Filter by date range

## Tech Stack

### Frontend

- Next.js 16
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

### Backend

- FastAPI
- SQLAlchemy
- PostgreSQL
- Pydantic
- JWT Authentication

### DevOps

- Docker
- Docker Compose

---

# Project Structure

```text
.
├── backend/
│   ├── app/
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   └── package.json
│
└── docker-compose.yml
```

---

# Getting Started

## Prerequisites

- Docker
- Docker Compose

or

- Python 3.11+
- Node.js 22+
- PostgreSQL

---

# Running with Docker

Clone the repository:

```bash
git clone <repository-url>
cd <repository-name>
```

Create environment files.

### Backend

```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/todo
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

### Frontend

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Run:

```bash
docker compose up --build
```

Application:

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:8000 |
| Swagger | http://localhost:8000/docs |

---

# Running Locally

## Backend

Install dependencies:

```bash
cd backend

python -m venv .venv

source .venv/bin/activate
```

Windows:

```powershell
.venv\Scripts\activate
```

Install packages:

```bash
pip install -r requirements.txt
```

Configure your `.env`.

Run:

```bash
uvicorn app.main:app --reload
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# API Endpoints

## Authentication

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/auth/register` | Register user |
| POST | `/auth/login` | Login |

---

## Tasks

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/tasks` | List tasks |
| GET | `/tasks/{id}` | Get task |
| POST | `/tasks` | Create task |
| PUT | `/tasks/{id}` | Update task |
| DELETE | `/tasks/{id}` | Delete task |

---

## Query Parameters

### List Tasks

Example:

```
GET /tasks?page=1&status=true&sort=priority&sortOrder=desc
```

| Parameter | Description |
|-----------|-------------|
| `page` | Page number |
| `status` | `true` / `false` |
| `sort` | `id`, `title`, `priority`, `done`, `created_at` |
| `sortOrder` | `asc` or `desc` |
| `startDate` | `YYYY-MM-DD` |
| `endDate` | `YYYY-MM-DD` |

---

# Testing

Run backend tests:

```bash
cd backend

pytest
```

## AI Usage

AI was used as a development assistant during this project. Specifically, it was used to:

- Explain unfamiliar FastAPI, SQLAlchemy, and pytest concepts.
- Answer questions about Next.js architecture and authentication.
- Suggest improvements to API design and project structure.
- Generate initial drafts for some unit tests and documentation, which were reviewed and adapted before use.
- Help troubleshoot development errors and understand error messages.

All implementation decisions, code integration, debugging, and final testing were performed manually.

# License

MIT