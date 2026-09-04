from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from bson import ObjectId
from app.config.settings import settings
from app.config.database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db=Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
        
    try:
        user = db["users"].find_one({"_id": ObjectId(user_id)})
    except Exception:
        raise credentials_exception
        
    if user is None:
        raise credentials_exception
        
    user["_id"] = str(user["_id"])
    user["id"] = str(user["_id"])
    user["role"] = str(user.get("role", "customer")).strip().lower()
    return user

def require_farmer(current_user: dict = Depends(get_current_user)):
    user_role = str(current_user.get("role", "")).strip().lower()
    if user_role != "farmer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Not enough permissions: farmer access required"
        )
    return current_user

def require_customer(current_user: dict = Depends(get_current_user)):
    user_role = str(current_user.get("role", "")).strip().lower()
    if user_role != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Not enough permissions: customer access required"
        )
    return current_user

def require_admin(current_user: dict = Depends(get_current_user)):
    user_role = str(current_user.get("role", "")).strip().lower()
    if user_role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Not enough permissions: admin access required"
        )
    return current_user

# Keep aliases for seamless backward compatibility across all routes
get_current_farmer = require_farmer
get_current_customer = require_customer
get_current_admin = require_admin
