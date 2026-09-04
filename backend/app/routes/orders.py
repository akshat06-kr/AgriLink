from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from app.models.schemas import OrderCreate, OrderResponse
from app.config.database import get_db
from app.utils.deps import get_current_user, get_current_customer, get_current_farmer

router = APIRouter()

@router.post("/", response_model=OrderResponse)
def create_order(order: OrderCreate, db=Depends(get_db), current_user=Depends(get_current_customer)):
    orders_col = db["orders"]
    products_col = db["products"]
    notifications_col = db["notifications"]
    
    if not order.items:
        raise HTTPException(status_code=400, detail="Order must contain at least one item")
        
    first_product_id = order.items[0].product_id
    try:
        product = products_col.find_one({"_id": ObjectId(first_product_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product ID")
        
    farmer_id = product["farmer_id"] if product else None
    
    order_dict = order.model_dump() if hasattr(order, 'model_dump') else order.dict()
    order_dict["customer_id"] = current_user["_id"]
    order_dict["customer_name"] = current_user.get("name", "Customer")
    order_dict["farmer_id"] = farmer_id
    order_dict["payment_status"] = "Paid" if order.payment_method == "UPI / Online" else "Pending"
    order_dict["order_status"] = "Order Placed"
    order_dict["created_at"] = datetime.utcnow()
    
    result = orders_col.insert_one(order_dict)
    order_id = str(result.inserted_id)
    order_dict["_id"] = order_id
    
    # Update inventory
    for item in order.items:
        try:
            products_col.update_one(
                {"_id": ObjectId(item.product_id)},
                {"$inc": {"quantity": -item.quantity}}
            )
        except Exception:
            pass
            
    # Send Notification to Customer
    notifications_col.insert_one({
        "user_id": current_user["_id"],
        "title": "Order Placed Successfully! 🎉",
        "message": f"Your order #{order_id[-6:].upper()} for ₹{order.total_amount:.2f} has been placed.",
        "type": "order",
        "read": False,
        "link": f"/customer/orders",
        "created_at": datetime.utcnow()
    })
    
    # Send Notification to Farmer if applicable
    if farmer_id:
        notifications_col.insert_one({
            "user_id": farmer_id,
            "title": "New Order Received! 🚜",
            "message": f"You received a new order #{order_id[-6:].upper()} worth ₹{order.total_amount:.2f}.",
            "type": "order",
            "read": False,
            "link": "/farmer/dashboard",
            "created_at": datetime.utcnow()
        })
    
    # Clear customer cart if exists
    db["carts"].delete_one({"customer_id": current_user["_id"]})
    
    return order_dict

@router.get("/customer", response_model=List[OrderResponse])
def get_customer_orders(db=Depends(get_db), current_user=Depends(get_current_customer)):
    orders_col = db["orders"]
    orders = list(orders_col.find({"customer_id": current_user["_id"]}).sort("created_at", -1))
    for o in orders:
        o["_id"] = str(o["_id"])
    return orders

@router.get("/customer/orders", response_model=List[OrderResponse])
def get_customer_orders_alias(db=Depends(get_db), current_user=Depends(get_current_customer)):
    return get_customer_orders(db=db, current_user=current_user)


@router.get("/farmer", response_model=List[OrderResponse])
def get_farmer_orders(db=Depends(get_db), current_user=Depends(get_current_farmer)):
    orders_col = db["orders"]
    orders = list(orders_col.find({"farmer_id": current_user["_id"]}).sort("created_at", -1))
    for o in orders:
        o["_id"] = str(o["_id"])
    return orders

@router.get("/{order_id}", response_model=OrderResponse)
def get_order_by_id(order_id: str, db=Depends(get_db), current_user=Depends(get_current_user)):
    orders_col = db["orders"]
    try:
        order = orders_col.find_one({"_id": ObjectId(order_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid order ID")
        
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    # Check permissions
    if current_user["role"] == "CUSTOMER" and order.get("customer_id") != current_user["_id"]:
        raise HTTPException(status_code=403, detail="Unauthorized")
    if current_user["role"] == "FARMER" and order.get("farmer_id") != current_user["_id"]:
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    order["_id"] = str(order["_id"])
    return order

@router.patch("/{order_id}/status")
def update_order_status(order_id: str, status: str, db=Depends(get_db), current_user=Depends(get_current_farmer)):
    orders_col = db["orders"]
    notifications_col = db["notifications"]
    valid_statuses = ["Order Placed", "Confirmed", "Packed", "Shipped", "Delivered"]
    
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    try:
        order = orders_col.find_one({"_id": ObjectId(order_id), "farmer_id": current_user["_id"]})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid order ID")
        
    if not order:
        raise HTTPException(status_code=404, detail="Order not found or unauthorized")
        
    orders_col.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"order_status": status}}
    )
    
    # Notify customer of status change
    if order.get("customer_id"):
        notifications_col.insert_one({
            "user_id": order["customer_id"],
            "title": f"Order Status Update: {status}",
            "message": f"Your order #{order_id[-6:].upper()} is now '{status}'.",
            "type": "order",
            "read": False,
            "link": "/customer/orders",
            "created_at": datetime.utcnow()
        })
        
    return {"message": "Order status updated successfully", "status": status}
