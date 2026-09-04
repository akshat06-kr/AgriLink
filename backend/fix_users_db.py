from datetime import datetime, timezone
from app.config.database import connect_to_mongo, get_db
from app.models.schemas import UserResponse

def fix_users():
    connect_to_mongo()
    db = get_db()
    
    users = list(db["users"].find())
    print(f"Total users in DB: {len(users)}")
    
    fixed_count = 0
    for u in users:
        updates = {}
        if "created_at" not in u or not u["created_at"]:
            updates["created_at"] = datetime.now(timezone.utc)
        if "phone" not in u or not u["phone"]:
            updates["phone"] = "9876543210"
        if "role" in u and isinstance(u["role"], str):
            updates["role"] = u["role"].upper()
            
        if updates:
            db["users"].update_one({"_id": u["_id"]}, {"$set": updates})
            fixed_count += 1
            
    print(f"Fixed {fixed_count} user records.")
    
    # Verify all users against UserResponse schema
    valid_count = 0
    for u in db["users"].find():
        u["_id"] = str(u["_id"])
        try:
            res = UserResponse(**u)
            valid_count += 1
        except Exception as e:
            print(f"User validation error for {u.get('email')}: {e}")
            
    print(f"Valid schema users: {valid_count} / {len(users)}")

if __name__ == "__main__":
    fix_users()
