from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from bson import ObjectId
from app.config.database import get_db
from app.models.schemas import CartItem, CartItemUpdate
from app.utils.deps import get_current_customer

router = APIRouter()

@router.get("/")
def get_cart(db=Depends(get_db), current_user=Depends(get_current_customer)):
    cart_col = db["carts"]
    cart = cart_col.find_one({"customer_id": current_user["_id"]})
    if not cart:
        return {"items": [], "total_amount": 0.0}
    return {
        "items": cart.get("items", []),
        "total_amount": sum(item.get("price", 0) * item.get("quantity", 0) for item in cart.get("items", []))
    }

@router.post("/")
def add_to_cart(item: CartItem, db=Depends(get_db), current_user=Depends(get_current_customer)):
    cart_col = db["carts"]
    cart = cart_col.find_one({"customer_id": current_user["_id"]})
    
    item_dict = item.model_dump() if hasattr(item, 'model_dump') else item.dict()
    
    if not cart:
        cart_col.insert_one({
            "customer_id": current_user["_id"],
            "items": [item_dict]
        })
    else:
        items = cart.get("items", [])
        # Check if already in cart
        found = False
        for it in items:
            if it.get("product_id") == item.product_id:
                it["quantity"] += item.quantity
                found = True
                break
        if not found:
            items.append(item_dict)
            
        cart_col.update_one(
            {"customer_id": current_user["_id"]},
            {"$set": {"items": items}}
        )
        
    return {"message": "Item added to cart", "item": item_dict}

@router.patch("/{product_id}")
def update_cart_item(product_id: str, item_update: CartItemUpdate, db=Depends(get_db), current_user=Depends(get_current_customer)):
    cart_col = db["carts"]
    cart = cart_col.find_one({"customer_id": current_user["_id"]})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
        
    items = cart.get("items", [])
    if item_update.quantity <= 0:
        items = [it for it in items if it.get("product_id") != product_id]
    else:
        for it in items:
            if it.get("product_id") == product_id:
                it["quantity"] = item_update.quantity
                break
                
    cart_col.update_one(
        {"customer_id": current_user["_id"]},
        {"$set": {"items": items}}
    )
    return {"message": "Cart updated", "items": items}

@router.delete("/{product_id}")
def remove_from_cart(product_id: str, db=Depends(get_db), current_user=Depends(get_current_customer)):
    cart_col = db["carts"]
    cart = cart_col.find_one({"customer_id": current_user["_id"]})
    if not cart:
        return {"message": "Cart is empty", "items": []}
        
    items = [it for it in cart.get("items", []) if it.get("product_id") != product_id]
    cart_col.update_one(
        {"customer_id": current_user["_id"]},
        {"$set": {"items": items}}
    )
    return {"message": "Item removed", "items": items}

@router.delete("/")
def clear_cart(db=Depends(get_db), current_user=Depends(get_current_customer)):
    cart_col = db["carts"]
    cart_col.delete_one({"customer_id": current_user["_id"]})
    return {"message": "Cart cleared successfully"}
