from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Swap for e.g. "postgresql://user:pass@localhost/dbname" in production
from .config import settings

engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False},  # only needed for SQLite
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()