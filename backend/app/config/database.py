import os
import re
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, PyMongoError
from fastapi import HTTPException, status
from app.config.settings import settings

class Database:
    client: MongoClient = None
    db = None

db_config = Database()

def get_sanitized_host(uri: str) -> str:
    """Safely extracts host information from a MongoDB URI without exposing credentials."""
    try:
        if "@" in uri:
            # Extract only the host portion after the @ symbol
            return uri.split("@")[-1].split("?")[0]
        # Mask password if standard mongodb://user:pass@host format
        return re.sub(r"://([^:]+):([^@]+)@", r"://\1:****@", uri)
    except Exception:
        return "hidden_host"

def connect_to_mongo():
    uri = settings.MONGO_URI or settings.MONGODB_URL or "mongodb://localhost:27017"
    db_name = settings.DATABASE_NAME or "agrilink_db"
    sanitized_host = get_sanitized_host(uri)
    
    # Check if running on Render cloud with unconfigured localhost URI
    if os.getenv("RENDER") and ("localhost" in uri or "127.0.0.1" in uri):
        print("[Database] CRITICAL WARNING: Running on Render with localhost MongoDB URI. Please configure the MONGO_URI environment variable in your Render Dashboard with your MongoDB Atlas connection string.")

    print(f"[Database] Initializing MongoDB connection to host: {sanitized_host} (database: {db_name})...")
    
    try:
        # Create PyMongo client with standard timeout
        db_config.client = MongoClient(
            uri,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
            socketTimeoutMS=10000,
        )
        
        # Always assign the Database object so db is never None
        db_config.db = db_config.client[db_name]
        
        # Verify connectivity
        db_config.client.admin.command("ping")
        print(f"[Database] Connected to MongoDB ({sanitized_host}) successfully.")
        return db_config.db
    except ConnectionFailure as e:
        print(f"[Database] Connection warning to MongoDB ({sanitized_host}): {e}. Request operations will retry.")
        return db_config.db
    except PyMongoError as e:
        print(f"[Database] PyMongo warning ({sanitized_host}): {e}.")
        return db_config.db
    except Exception as e:
        print(f"[Database] Unexpected error during MongoDB initialization ({sanitized_host}): {e}")
        return db_config.db

def close_mongo_connection():
    if db_config.client:
        try:
            db_config.client.close()
            print("[Database] MongoDB connection closed.")
        except Exception:
            pass

def get_db():
    """
    FastAPI dependency that provides an active MongoDB database instance.
    Guarantees a valid database object or raises a clean HTTP 503 error.
    """
    if db_config.db is None:
        connect_to_mongo()
        
    if db_config.db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable. Please check that MONGO_URI is configured correctly."
        )
    return db_config.db
