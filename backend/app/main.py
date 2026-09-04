from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.database import connect_to_mongo, close_mongo_connection
from app.config.settings import settings
from app.routes import auth, products, orders, reports, farmers, cart, notifications, expenses

app = FastAPI(title=settings.PROJECT_NAME)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "https://agrilink-frontend-ektn.onrender.com",
]

# Append FRONTEND_URL from environment if defined
if settings.FRONTEND_URL:
    for url in settings.FRONTEND_URL.split(","):
        clean_url = url.strip().rstrip("/")
        if clean_url:
            if not clean_url.startswith("http://") and not clean_url.startswith("https://"):
                secure_url = f"https://{clean_url}"
                if secure_url not in origins:
                    origins.append(secure_url)
            elif clean_url not in origins:
                origins.append(clean_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"^https?://([a-zA-Z0-9-]+\.)*(onrender\.com|vercel\.app|netlify\.app|localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(orders.router, prefix="/api/orders", tags=["orders"])
app.include_router(orders.router, prefix="/api/customer", tags=["customer"])
app.include_router(farmers.router, prefix="/api/farmers", tags=["farmers"])
app.include_router(farmers.router, prefix="/api/farmer", tags=["farmer"])
app.include_router(cart.router, prefix="/api/cart", tags=["cart"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(reports.router, prefix="/api/farmer/reports", tags=["farmer_reports"])
app.include_router(expenses.router, prefix="/api/expenses", tags=["expenses"])
app.include_router(expenses.router, prefix="/api/farmer/expenses", tags=["farmer_expenses"])

@app.on_event("startup")
async def startup_db_client():
    connect_to_mongo()
    from app.utils.normalize_roles import normalize_database_roles
    normalize_database_roles()

@app.on_event("shutdown")
async def shutdown_db_client():
    close_mongo_connection()

@app.get("/")
def root():
    return {"message": "Welcome to AgriLink API"}

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "message": "AgriLink backend is running"
    }
