import re
from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
from bson import ObjectId
from app.models.schemas import UserCreate, UserLogin, Token, UserResponse
from app.utils.security import get_password_hash, verify_password, create_access_token
from app.utils.deps import get_current_user
from app.config.database import get_db

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    """
    Returns the authenticated user's profile with verified normalized role.
    Used by frontend session restoration to guarantee fresh MongoDB role truth.
    """
    user_data = dict(current_user)
    user_data["_id"] = str(user_data["_id"])
    user_data["id"] = str(user_data["_id"])
    user_data["role"] = str(user_data.get("role", "customer")).strip().lower()
    return user_data

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db=Depends(get_db)):
    users_collection = db["users"]
    clean_email = user.email.strip().lower()
    
    try:
        # Case-insensitive duplicate check
        if users_collection.find_one({"email": {"$regex": f"^{re.escape(clean_email)}$", "$options": "i"}}):
            raise HTTPException(status_code=409, detail="An account with this email already exists. Please login.")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Registration DB check error: {e}")
        raise HTTPException(status_code=500, detail="Unable to create your account right now. Database is unavailable.")
        
    user_dict = user.dict()
    user_dict["email"] = clean_email
    raw_role = user.role.value if hasattr(user.role, 'value') else str(user.role)
    user_role = raw_role.strip().lower()
    if user_role not in ["customer", "farmer"]:
        user_role = "customer"
    user_dict["role"] = user_role
    user_dict["password_hash"] = get_password_hash(user_dict.pop("password"))
    user_dict["created_at"] = datetime.utcnow()
    
    # Structure farm details if role is farmer
    if user_role == "farmer":
        crop_cats = user.crop_categories
        if not crop_cats and user.crops:
            crop_cats = user.crops if isinstance(user.crops, list) else [str(user.crops)]
        farm_desc = user.farm_description or user.description
        user_dict["farm_details"] = {
            "farm_name": user.farm_name,
            "farm_location": user.farm_location,
            "crop_categories": crop_cats,
            "farming_type": user.farming_type,
            "farm_description": farm_desc
        }
    
    # Remove flattened optional fields
    for field in ["farm_name", "farm_location", "crop_categories", "crops", "farming_type", "farm_description", "description"]:
        if field in user_dict:
            del user_dict[field]
            
    try:
        result = users_collection.insert_one(user_dict)
        user_id_str = str(result.inserted_id)
        user_dict["_id"] = user_id_str
        user_dict["id"] = user_id_str
    except Exception as e:
        print(f"Registration DB insert error: {e}")
        raise HTTPException(status_code=500, detail="Unable to create your account right now. Database is unavailable.")
    
    return user_dict

@router.post("/login", response_model=Token)
def login(user_credentials: UserLogin, db=Depends(get_db)):
    users_collection = db["users"]
    clean_email = user_credentials.email.strip().lower()
    
    # 1. Look up user case-insensitively by email
    try:
        user = users_collection.find_one({"email": {"$regex": f"^{re.escape(clean_email)}$", "$options": "i"}})
    except Exception as e:
        print(f"[Auth] Database lookup error during login: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection error. Please verify that MONGO_URI is set correctly in Render environment variables."
        )
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
        
    # 2. Verify password
    if not verify_password(user_credentials.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    # 3 & 4. Read actual role from database and normalize to lowercase
    actual_role = str(user.get("role", "customer")).strip().lower()
    
    # 5 & 6. Compare requested role if provided
    if user_credentials.role:
        raw_req = user_credentials.role.value if hasattr(user_credentials.role, 'value') else str(user_credentials.role)
        requested_role = raw_req.strip().lower()
        if requested_role != actual_role:
            display_role = actual_role.capitalize()
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This account is registered as a {display_role}. Please select the {display_role} role."
            )
    
    # 7. Generate JWT with sub, email, and normalized role
    user_id_str = str(user["_id"])
    user["_id"] = user_id_str
    user["id"] = user_id_str
    user["role"] = actual_role
    if "created_at" not in user or not user["created_at"]:
        user["created_at"] = datetime.utcnow()
    if "phone" not in user or not user["phone"]:
        user["phone"] = "N/A"
    
    access_token = create_access_token(
        subject=user_id_str,
        role=actual_role,
        email=clean_email
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


