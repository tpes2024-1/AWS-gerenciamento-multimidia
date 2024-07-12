from fastapi import APIRouter, Depends, HTTPException, status
from ..schemas import User, UserCreate
from ..models import db
from ..security import get_password_hash, get_current_active_user

router = APIRouter()

@router.post("/register", response_model=User)
async def register_user(user: UserCreate):
    if user.username in db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nome de usuário já registrado",
        )
    hashed_password = get_password_hash(user.password)
    db[user.username] = {
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "hashed_password": hashed_password,
        "disabled": False,
    }
    return db[user.username]

@router.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

@router.get("/users/me/items")
async def read_users_me_items(current_user: User = Depends(get_current_active_user)):
    return [{"item_id": 1, "owner": current_user.username, "title": "Item Teste"}]
