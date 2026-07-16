# Task Manager API

A small FastAPI backend with JWT authentication and a per-user task list. Built with FastAPI, SQLAlchemy, and Pydantic.

## Stack

- **FastAPI** — web framework
- **SQLAlchemy 2.0** — ORM (Postgres)
- **Pydantic v2** / **pydantic-settings** — request/response validation and `.env`-based config
- **python-jose** — JWT creation/verification
- **passlib + bcrypt** — password hashing

## Project structure

```
app/
  config.py         # Settings loaded from .env (DB URL, JWT secret, etc.)
  database.py        # SQLAlchemy engine/session setup
  models.py           # User and Task ORM models
  schemas.py          # Pydantic schemas (request/response shapes)
  security.py         # Password hashing + JWT encode/decode
  deps.py             # get_current_user dependency (validates bearer token)
  main.py              # App entrypoint, creates tables, mounts routers
  routers/
    auth.py            # /auth/register, /auth/login
    users.py            # /users/me
    tasks.py            # /tasks CRUD + list with pagination/filter/sort
requirements.txt
.env / .env.example
```

## Setup

```bash
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Copy the example env file and adjust as needed:

```bash
cp .env.example .env
```

`.env` variables:

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./app.db` | SQLAlchemy connection string. Use a `postgresql://...` URL for Postgres. |
| `SECRET_KEY` | *(required, no default)* | Secret used to sign JWTs. Generate one with `python3 -c "import secrets; print(secrets.token_hex(32))"`. |
| `ALGORITHM` | `HS256` | JWT signing algorithm. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` (1 day) | Token lifetime. |

`.env` must sit in the same directory you run `uvicorn` from (i.e. next to `app/`), since `pydantic-settings` resolves it relative to the current working directory.

## Running

```bash
uvicorn app.main:app --reload
```

The API is served at `http://localhost:8000`. Interactive docs (Swagger UI) are at `http://localhost:8000/docs`; use the "Authorize" button there to attach a bearer token after logging in.

## Authentication

All `/tasks` and `/users` endpoints require a bearer token, obtained from `/auth/register` or `/auth/login`:

```
Authorization: Bearer <access_token>
```

Requests with a missing, malformed, or expired token get `401 Unauthorized`.

## Endpoints

### Auth — `/auth`

| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Create a new user. `400` if the email is already registered. Returns a token + user. |
| POST | `/auth/login` | Log in with email + password. `401` on bad credentials. Returns a token + user. |

**Request body** (both): `{ "email": "...", "password": "..." }`
**Response body** (both):
```json
{
  "access_token": "...",
  "token_type": "bearer",
  "user": { "id": 1, "email": "you@example.com" }
}
```

### Users — `/users`

| Method | Path | Description |
|---|---|---|
| GET | `/users/me` | Returns the authenticated user. `401` if the token is missing/invalid/expired. |

### Tasks — `/tasks`

All task routes are scoped to the authenticated user — you can only see, edit, or delete your own tasks (`404` if a task exists but belongs to someone else).

| Method | Path | Description |
|---|---|---|
| POST | `/tasks/` | Create a task. Body: `{ "title": "...", "done": false, "priority": 1 }` (`priority` 1–10). |
| GET | `/tasks/` | List tasks — paginated, filterable, sortable (see below). |
| GET | `/tasks/{id}` | Get a single task. `404` if not found or not owned by you. |
| PUT | `/tasks/{id}` | Partially update a task. Body: any subset of `title`, `done`, `priority`. |
| DELETE | `/tasks/{id}` | Delete a task. Returns `204 No Content`. |

**`GET /tasks/` query params:**

| Param | Type | Default | Notes |
|---|---|---|---|
| `page` | int | `1` | 1-indexed. Page size is fixed at 10. |
| `status` | bool | *(none)* | Filter by `done`. Omit to get all tasks regardless of status. |
| `sort` | string | `id` | Any real column on `Task`: `id`, `title`, `done`, `priority`, `owner_id`. Invalid values return `422` with the valid list. |
| `sortOrder` | `asc` \| `desc` | `asc` | |

Example: `GET /tasks/?page=2&status=false&sort=priority&sortOrder=desc`

**Response:**
```json
{
  "data": [
    { "id": 1, "title": "Buy milk", "done": false, "priority": 5, "owner_id": 1 }
  ],
  "has_more_pages": true,
  "page_number": 2
}
```

## Database

Tables are created automatically on startup (`Base.metadata.create_all`) — no migration step needed for local dev. For a real deployment, swap this for [Alembic](https://alembic.sqlalchemy.org/) migrations so schema changes are tracked and reversible.

## Switching to Postgres

1. Set `DATABASE_URL` in `.env` to `postgresql://user:password@host:5432/dbname`.
2. That's it — `database.py` only applies the SQLite-specific `check_same_thread` connect arg when the URL starts with `sqlite`, so Postgres works with no other code changes.

## Notes / known limitations

- No refresh tokens — access tokens are long-lived (default 1 day) and there's no revocation list. Fine for a small app; add refresh tokens or a token blocklist if you need shorter-lived access tokens with silent renewal.
- No rate limiting on `/auth/login` or `/auth/register`.
- `SECRET_KEY` has no default on purpose — the app refuses to start without one, so you can't accidentally deploy with a placeholder secret.