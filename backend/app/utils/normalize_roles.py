import logging
from app.config.database import get_db
from app.utils.security import get_password_hash

logger = logging.getLogger("agrilink.normalize")

def normalize_database_roles():
    """
    Safely normalizes all user roles in MongoDB to lowercase:
    'customer', 'farmer', 'admin'.
    Preserves all existing users, passwords, and user data.
    Ensures baseline demo accounts exist with lowercase roles.
    """
    try:
        db = get_db()
        users_col = db["users"]
        
        # 1. Normalize existing user roles to lowercase
        users = list(users_col.find())
        updated_count = 0
        for u in users:
            raw_role = u.get("role")
            if raw_role:
                clean_role = str(raw_role).strip().lower()
                if clean_role not in ["customer", "farmer", "admin"]:
                    clean_role = "customer"
                if u.get("role") != clean_role:
                    users_col.update_one({"_id": u["_id"]}, {"$set": {"role": clean_role}})
                    updated_count += 1
            else:
                users_col.update_one({"_id": u["_id"]}, {"$set": {"role": "customer"}})
                updated_count += 1

        logger.info(f"Normalized {updated_count} user roles to lowercase.")

        # 2. Ensure baseline demo accounts exist with active bcrypt hash for password123
        demo_accounts = [
            {
                "email": "customer@agrichain.com",
                "name": "Demo Customer",
                "phone": "+91 98765 43210",
                "role": "customer",
                "address": "Green Park, New Delhi, India"
            },
            {
                "email": "farmer@agrichain.com",
                "name": "Demo Farmer Ramesh",
                "phone": "+91 91234 56789",
                "role": "farmer",
                "farm_details": {
                    "farm_name": "Ramesh Organic Farms",
                    "location": "Nashik, Maharashtra",
                    "size_acres": 5.5,
                    "crop_types": ["Wheat", "Organic Tomatoes", "Alphonso Mangoes"],
                    "farming_method": "100% Organic, Chemical-Free",
                    "experience_years": 12
                }
            },
            {
                "email": "admin@agrichain.com",
                "name": "AgriLink System Admin",
                "phone": "+91 99999 00000",
                "role": "admin"
            }
        ]

        sample_hash = get_password_hash("password123")

        for demo in demo_accounts:
            existing = users_col.find_one({"email": demo["email"]})
            if not existing:
                demo_data = dict(demo)
                demo_data["password_hash"] = sample_hash
                users_col.insert_one(demo_data)
                logger.info(f"Created demo account {demo['email']} with role {demo['role']}")
            else:
                updates = {"role": demo["role"]}
                if not existing.get("password_hash"):
                    updates["password_hash"] = sample_hash
                users_col.update_one({"_id": existing["_id"]}, {"$set": updates})

    except Exception as e:
        logger.error(f"Error while normalizing database roles: {e}")

if __name__ == "__main__":
    from app.config.database import connect_to_mongo
    connect_to_mongo()
    normalize_database_roles()
    print("Database roles normalized successfully.")
