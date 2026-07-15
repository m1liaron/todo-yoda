from fastapi import FastAPI

from .routers import auth, tasks
from .database import Base, engine

# Creates tables on startup if they don't exist.
# For real projects, prefer Alembic migrations instead.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Task Manager API")

app.include_router(auth.router)
app.include_router(tasks.router)


@app.get("/")
def health_check():
    return {"status": "ok"}