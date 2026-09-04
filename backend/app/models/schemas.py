from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any, Dict, Union
from datetime import datetime
from enum import Enum

class RoleEnum(str, Enum):
    CUSTOMER = "customer"
    FARMER = "farmer"
    ADMIN = "admin"

    @classmethod
    def _missing_(cls, value):
        if isinstance(value, str):
            clean_val = value.strip().lower()
            for member in cls:
                if member.value == clean_val or member.name.lower() == clean_val:
                    return member
        return None

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str
    role: RoleEnum
    # Farmer specific
    farm_name: Optional[str] = None
    farm_location: Optional[str] = None
    crop_categories: Optional[List[str]] = None
    crops: Optional[Union[List[str], str]] = None
    farming_type: Optional[str] = None
    farm_description: Optional[str] = None
    description: Optional[str] = None
    # Customer specific
    address: Optional[Union[str, Dict[str, Any]]] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    role: Optional[RoleEnum] = None

class UserResponse(BaseModel):
    id: Optional[str] = Field(default=None, validation_alias="_id")
    name: str
    email: EmailStr
    phone: Optional[str] = "N/A"
    role: RoleEnum
    farm_details: Optional[dict] = None
    address: Optional[Union[str, Dict[str, Any]]] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str

class ReviewResponse(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    product_id: str
    customer_id: str
    customer_name: str
    rating: int
    comment: str
    created_at: datetime

    class Config:
        populate_by_name = True

class NutritionInfo(BaseModel):
    serving_size: Optional[str] = "100g"
    calories: Optional[float] = None
    protein: Optional[float] = None
    carbohydrates: Optional[float] = None
    fat: Optional[float] = None
    fiber: Optional[float] = None
    vitamins: Optional[str] = None
    minerals: Optional[str] = None

class OriginDetails(BaseModel):
    farm_name: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class ProductCreate(BaseModel):
    name: str
    category: str
    description: str
    price: float
    market_price: float
    quantity: float
    unit: str
    image: str
    images: Optional[List[str]] = None
    location: str
    harvest_date: Optional[str] = None
    organic: bool = False
    farm_name: Optional[str] = None
    farming_type: Optional[str] = None
    farming_method: Optional[str] = None
    storage_info: Optional[str] = None
    rating: Optional[float] = 4.8
    review_count: Optional[int] = 0
    distance_km: Optional[int] = None
    farmer_avatar: Optional[str] = None
    farmer_bio: Optional[str] = None
    nutrients: Optional[dict] = None
    nutrition: Optional[NutritionInfo] = None
    origin: Optional[OriginDetails] = None
    benefits: Optional[List[str]] = None
    breakdown: Optional[dict] = None
    production_cost: Optional[float] = 0.0
    units_sold: Optional[float] = 0.0

class ProductResponse(ProductCreate):
    id: str = Field(alias="_id")
    farmer_id: str
    farmer_name: Optional[str] = None
    status: str = "pending"
    created_at: datetime

    class Config:
        populate_by_name = True

class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: float
    price: float
    unit: Optional[str] = "kg"
    image: Optional[str] = None
    farmer_name: Optional[str] = None

class OrderCreate(BaseModel):
    items: List[OrderItem]
    total_amount: float
    delivery_address: str
    payment_method: Optional[str] = "Cash on Delivery"

class OrderResponse(OrderCreate):
    id: str = Field(alias="_id")
    customer_id: str
    customer_name: Optional[str] = None
    farmer_id: Optional[str] = None
    payment_status: str = "Pending"
    order_status: str = "Order Placed"
    created_at: datetime

    class Config:
        populate_by_name = True

class CartItem(BaseModel):
    product_id: str
    name: str
    price: float
    market_price: float
    quantity: float
    unit: str
    image: str
    farmer_name: Optional[str] = None
    farmer_id: Optional[str] = None
    location: Optional[str] = None
    organic: Optional[bool] = False

class CartItemUpdate(BaseModel):
    quantity: float

class ExpenseCreate(BaseModel):
    category: str
    amount: float
    date: str  # ISO date string YYYY-MM-DD
    description: Optional[str] = ""

class ExpenseResponse(BaseModel):
    id: str = Field(alias="_id")
    farmer_id: str
    category: str
    amount: float
    date: str
    description: Optional[str] = ""
    created_at: datetime

    class Config:
        populate_by_name = True

class NotificationItem(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    title: str
    message: str
    type: str # order, promo, alert
    read: bool = False
    link: Optional[str] = None
    created_at: datetime

    class Config:
        populate_by_name = True
