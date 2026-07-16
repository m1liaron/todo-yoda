from fastapi import APIRouter, Depends

from .. import models, schemas
from ..deps import get_current_user

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(get_current_user)):
    """
    Returns the currently authenticated user.
    get_current_user decodes and validates the bearer token, raising 401
    if it's missing, malformed, expired, or doesn't match a real user.
    """
    return current_user