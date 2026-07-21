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

# ---------- Category ----------
 
class CategoryBase(BaseModel):
    title: str
 
 
class CategoryCreate(CategoryBase):
    pass
 
 
class CategoryUpdate(BaseModel):
    title: Optional[str] = None
 
 
class CategoryOut(CategoryBase):
    id: int
    owner_id: int
 
    class Config:
        from_attributes = True

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
    categories: list[CategoryOut]

    class Config:
        from_attributes = True



class TaskListResponse(BaseModel):
    data: list[TaskOut]
    has_more_pages: bool
    page_number: int

# ---------- Category ----------
class CategoryBase(BaseModel):
    title: str
 
class CategoryCreate(CategoryBase):
    pass
 
class CategoryUpdate(BaseModel):
    title: Optional[str] = None
 
class CategoryOut(CategoryBase):
    id: int
    owner_id: int
 
    class Config:
        from_attributes = True
