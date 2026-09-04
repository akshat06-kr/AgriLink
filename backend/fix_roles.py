from app.config.database import connect_to_mongo, get_db

connect_to_mongo()
db = get_db()

users = list(db.users.find())
for u in users:
    current_role = str(u.get('role', 'CUSTOMER')).upper()
    db.users.update_one({'_id': u['_id']}, {'$set': {'role': current_role}})
    print(f"User {u.get('email')} -> {current_role}")

print("All user roles updated successfully.")
