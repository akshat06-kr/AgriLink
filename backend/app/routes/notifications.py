from fastapi import APIRouter, Depends, HTTPException
from typing import List
from bson import ObjectId
from datetime import datetime
from app.config.database import get_db
from app.models.schemas import NotificationItem
from app.utils.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=List[NotificationItem])
def get_notifications(db=Depends(get_db), current_user=Depends(get_current_user)):
    notifications_col = db["notifications"]
    notifications = list(notifications_col.find({"user_id": current_user["_id"]}).sort("created_at", -1).limit(20))
    for n in notifications:
        n["_id"] = str(n["_id"])
    return notifications

@router.patch("/{notification_id}/read")
def mark_as_read(notification_id: str, db=Depends(get_db), current_user=Depends(get_current_user)):
    notifications_col = db["notifications"]
    try:
        notifications_col.update_one(
            {"_id": ObjectId(notification_id), "user_id": current_user["_id"]},
            {"$set": {"read": True}}
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid notification ID")
    return {"message": "Notification marked as read"}

@router.patch("/read-all")
def mark_all_read(db=Depends(get_db), current_user=Depends(get_current_user)):
    notifications_col = db["notifications"]
    notifications_col.update_many(
        {"user_id": current_user["_id"]},
        {"$set": {"read": True}}
    )
    return {"message": "All notifications marked as read"}
