from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from app.config.settings import settings

class Database:
    client: MongoClient = None
    db = None

db_config = Database()

def connect_to_mongo():
    masked_url = settings.MONGODB_URL.split("@")[-1] if "@" in settings.MONGODB_URL else settings.MONGODB_URL
    print(f"Connecting to MongoDB host: {masked_url}")
    try:
        db_config.client = MongoClient(
            settings.MONGODB_URL,
            serverSelectionTimeoutMS=5000,
        )
        db_config.db = db_config.client[settings.DATABASE_NAME]
        db_config.client.admin.command("ping")
        print("Connected to MongoDB successfully")
    except ConnectionFailure as e:
        print(f"WARNING: Initial MongoDB connection check failed: {e}. Will retry on incoming requests.")
    except Exception as e:
        print(f"WARNING: MongoDB connection warning: {e}")

def close_mongo_connection():
    if db_config.client:
        try:
            db_config.client.close()
            print("MongoDB connection closed")
        except Exception:
            pass

def get_db():
    return db_config.db
