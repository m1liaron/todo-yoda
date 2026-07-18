from sqlalchemy import ( Column, Integer, String, Boolean, ForeignKey, CheckConstraint, Date, Table)
from sqlalchemy.orm import relationship

from .database import Base

task_categories = Table(
    "task_categories",
    Base.metadata,
    Column("task_id", ForeignKey("tasks.id", ondelete="CASCADE"), primary_key=True),
    Column("category_id", ForeignKey("categories.id", ondelete="CASCADE"), primary_key=True)
)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)  # stores the hashed password

    tasks = relationship("Task", back_populates="owner", cascade="all, delete-orphan")
    categories = relationship("Category", back_populates="owner", cascade="all, delete-orphan")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    done = Column(Boolean, default=False, nullable=False)
    priority = Column(Integer, default=1, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    owner = relationship("User", back_populates="tasks")
    categories = relationship(
        "Category", secondary=task_categories, back_populates="tasks"
    )

    __table_args__ = (
        CheckConstraint("priority >= 1 AND priority <= 10", name="check_priority_range"),
    )

class Category(Base):
    __tablename__ = "categories"
 
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
 
    owner = relationship("User", back_populates="categories")
    tasks = relationship(
        "Task", secondary=task_categories, back_populates="categories"
    )
