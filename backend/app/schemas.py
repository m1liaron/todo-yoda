from typing import Optional
from pydantic import BaseModel, EmailStr, Field


# ---------- Auth / User ----------

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: EmailStr

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Task ----------

class TaskBase(BaseModel):
    title: str
    done: bool = False
    priority: int = Field(default=1, ge=1, le=10)


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    done: Optional[bool] = None
    priority: Optional[int] = Field(default=None, ge=1, le=10)


class TaskOut(TaskBase):
    id: int
    owner_id: int

    class Config:
        from_attributes = True