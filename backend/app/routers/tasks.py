from typing import List, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import inspect

from .. import models

from .. import schemas
from ..database import get_db
from ..deps import get_current_user

router = APIRouter(prefix="/tasks", tags=["tasks"])

PAGE_SIZE = 10
SORTABLE_FIELDS = {c.key for c in inspect(models.Task).mapper.column_attrs}

def _get_owned_task_or_404(task_id: int, db: Session, user: models.User) -> models.Task:
    task = (
        db.query(models.Task)
        .filter(models.Task.id == task_id, models.Task.owner_id == user.id)
        .first()
    )
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


@router.post("/", response_model=schemas.TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(
    task_in: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    task = models.Task(**task_in.model_dump(), owner_id=current_user.id)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("/", response_model=schemas.TaskListResponse)
def list_tasks(
    page: int = Query(1, ge=1, description="1-indexed page number"),
    status_filter: Optional[bool] = Query(
        None, alias="status", description="Filter by done status"
    ),
    sort: str = Query("id", description="Task field to sort by, e.g. title, priority, id"),
    sortOrder: Literal["asc", "desc"] = Query("asc"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = db.query(models.Task).filter(models.Task.owner_id == current_user.id)

    if status_filter is not None:
        query = query.filter(models.Task.done == status_filter)
 
    if sort not in SORTABLE_FIELDS:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid sort field '{sort}'. Must be one of: {sorted(SORTABLE_FIELDS)}",
        )


    sort_column = getattr(models.Task, sort)
    sort_column = sort_column.desc() if sortOrder == "desc" else sort_column.asc()
    query = query.order_by(sort_column)
 
    total = query.count()
    offset = (page - 1) * PAGE_SIZE
    tasks = query.offset(offset).limit(PAGE_SIZE).all()
 
    has_more_pages = offset + len(tasks) < total
 
    return schemas.TaskListResponse(
        data=tasks,
        has_more_pages=has_more_pages,
        page_number=page,
    )



@router.get("/{task_id}", response_model=schemas.TaskOut)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return _get_owned_task_or_404(task_id, db, current_user)


@router.put("/{task_id}", response_model=schemas.TaskOut)
def update_task(
    task_id: int,
    task_in: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    task = _get_owned_task_or_404(task_id, db, current_user)

    update_data = task_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    task = _get_owned_task_or_404(task_id, db, current_user)
    db.delete(task)
    db.commit()
    return None