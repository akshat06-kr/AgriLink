from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from app.models.schemas import ProductCreate, ProductResponse, ReviewCreate, ReviewResponse
from app.config.database import get_db
from app.utils.deps import get_current_user, get_current_farmer, get_current_customer

router = APIRouter()

@router.post("/", response_model=ProductResponse)
def create_product(product: ProductCreate, db=Depends(get_db), current_user=Depends(get_current_farmer)):
    products_col = db["products"]
    
    prod_dict = product.model_dump() if hasattr(product, 'model_dump') else product.dict()
    prod_dict["farmer_id"] = current_user["_id"]
    prod_dict["farmer_name"] = current_user.get("name", "Unknown Farmer")
    prod_dict["farm_name"] = current_user.get("farm_details", {}).get("farm_name", prod_dict.get("farm_name", "Local Farm"))
    prod_dict["status"] = "approved"
    prod_dict["created_at"] = datetime.utcnow()
    prod_dict["review_count"] = 0
    if not prod_dict.get("rating"):
        prod_dict["rating"] = 4.8
    
    result = products_col.insert_one(prod_dict)
    prod_dict["_id"] = str(result.inserted_id)
    
    return prod_dict

@router.get("/", response_model=List[ProductResponse])
def get_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    organic: Optional[bool] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort: Optional[str] = None,
    db=Depends(get_db)
):
    products_col = db["products"]
    query = {"status": "approved"}
    
    if category and category != "All":
        if category == "Organic Products":
            query["organic"] = True
        else:
            query["category"] = {"$regex": f"^{category}$", "$options": "i"}
    
    if organic is not None and organic:
        query["organic"] = True
        
    if search and search.strip():
        s = search.strip()
        words = [w for w in s.split() if len(w) > 1]
        or_conditions = [
            {"name": {"$regex": s, "$options": "i"}},
            {"category": {"$regex": s, "$options": "i"}},
            {"farmer_name": {"$regex": s, "$options": "i"}},
            {"farm_name": {"$regex": s, "$options": "i"}},
            {"location": {"$regex": s, "$options": "i"}},
            {"description": {"$regex": s, "$options": "i"}}
        ]
        for w in words:
            or_conditions.extend([
                {"name": {"$regex": w, "$options": "i"}},
                {"farmer_name": {"$regex": w, "$options": "i"}},
                {"farm_name": {"$regex": w, "$options": "i"}},
                {"location": {"$regex": w, "$options": "i"}}
            ])
        query["$or"] = or_conditions
        
    if min_price is not None or max_price is not None:
        price_query = {}
        if min_price is not None:
            price_query["$gte"] = min_price
        if max_price is not None:
            price_query["$lte"] = max_price
        query["price"] = price_query
        
    sort_criteria = [("created_at", -1)]
    if sort == "price_asc":
        sort_criteria = [("price", 1)]
    elif sort == "price_desc":
        sort_criteria = [("price", -1)]
    elif sort == "rating":
        sort_criteria = [("rating", -1)]
    elif sort == "newest":
        sort_criteria = [("created_at", -1)]

    products = list(products_col.find(query).sort(sort_criteria))
    for p in products:
        p["_id"] = str(p["_id"])
        
    return products

@router.get("/search", response_model=List[ProductResponse])
def search_products(q: str = Query(..., min_length=1), db=Depends(get_db)):
    products_col = db["products"]
    words = [w for w in q.strip().split() if len(w) > 1]
    or_conditions = [
        {"name": {"$regex": q, "$options": "i"}},
        {"category": {"$regex": q, "$options": "i"}},
        {"farmer_name": {"$regex": q, "$options": "i"}},
        {"farm_name": {"$regex": q, "$options": "i"}},
        {"location": {"$regex": q, "$options": "i"}},
        {"description": {"$regex": q, "$options": "i"}}
    ]
    for w in words:
        or_conditions.extend([
            {"name": {"$regex": w, "$options": "i"}},
            {"farmer_name": {"$regex": w, "$options": "i"}},
            {"farm_name": {"$regex": w, "$options": "i"}},
            {"location": {"$regex": w, "$options": "i"}}
        ])
    query = {
        "status": "approved",
        "$or": or_conditions
    }
    products = list(products_col.find(query))
    for p in products:
        p["_id"] = str(p["_id"])
    return products

@router.get("/category/{category}", response_model=List[ProductResponse])
def get_products_by_category(category: str, db=Depends(get_db)):
    products_col = db["products"]
    query = {"status": "approved"}
    if category.lower() == "organic" or category.lower() == "organic products":
        query["organic"] = True
    else:
        query["category"] = {"$regex": f"^{category}$", "$options": "i"}
        
    products = list(products_col.find(query))
    for p in products:
        p["_id"] = str(p["_id"])
    return products

@router.get("/farmer", response_model=List[ProductResponse])
def get_farmer_products(db=Depends(get_db), current_user=Depends(get_current_farmer)):
    products_col = db["products"]
    products = list(products_col.find({"farmer_id": current_user["_id"]}))
    for p in products:
        p["_id"] = str(p["_id"])
    return products

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: str, db=Depends(get_db)):
    products_col = db["products"]
    try:
        product = products_col.find_one({"_id": ObjectId(product_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product ID format")
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    product["_id"] = str(product["_id"])
    return product

@router.get("/{product_id}/reviews", response_model=List[ReviewResponse])
def get_product_reviews(product_id: str, db=Depends(get_db)):
    reviews_col = db["reviews"]
    reviews = list(reviews_col.find({"product_id": product_id}).sort("created_at", -1))
    for r in reviews:
        r["_id"] = str(r["_id"])
    return reviews

@router.post("/{product_id}/reviews", response_model=ReviewResponse)
def add_product_review(
    product_id: str,
    review_in: ReviewCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_customer)
):
    products_col = db["products"]
    reviews_col = db["reviews"]
    orders_col = db["orders"]
    
    try:
        product = products_col.find_one({"_id": ObjectId(product_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product ID")
        
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    # Check if customer has purchased this product
    has_purchased = orders_col.find_one({
        "customer_id": current_user["_id"],
        "items.product_id": product_id
    })
    if not has_purchased:
        raise HTTPException(
            status_code=403, 
            detail="You can only review products you have purchased from AgriLink."
        )

    review_doc = {
        "product_id": product_id,
        "customer_id": current_user["_id"],
        "customer_name": current_user.get("name", "Customer"),
        "rating": review_in.rating,
        "comment": review_in.comment,
        "created_at": datetime.utcnow()
    }
    
    res = reviews_col.insert_one(review_doc)
    review_doc["_id"] = str(res.inserted_id)
    
    # Recalculate average rating
    all_reviews = list(reviews_col.find({"product_id": product_id}))
    if all_reviews:
        avg_rating = round(sum(r["rating"] for r in all_reviews) / len(all_reviews), 1)
        products_col.update_one(
            {"_id": ObjectId(product_id)},
            {"$set": {"rating": avg_rating, "review_count": len(all_reviews)}}
        )
        
    return review_doc

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(product_id: str, product: ProductCreate, db=Depends(get_db), current_user=Depends(get_current_farmer)):
    products_col = db["products"]
    try:
        existing = products_col.find_one({"_id": ObjectId(product_id), "farmer_id": current_user["_id"]})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product ID")

    if not existing:
        raise HTTPException(status_code=404, detail="Product not found or unauthorized")

    update_dict = product.model_dump() if hasattr(product, 'model_dump') else product.dict()
    # Preserve immutable fields
    update_dict["farmer_id"] = current_user["_id"]
    update_dict["farmer_name"] = current_user.get("name", existing.get("farmer_name", ""))
    update_dict["farm_name"] = existing.get("farm_name", update_dict.get("farm_name", ""))
    update_dict["status"] = existing.get("status", "approved")
    update_dict["created_at"] = existing.get("created_at")
    update_dict["review_count"] = existing.get("review_count", 0)
    update_dict["rating"] = existing.get("rating", 4.8)

    products_col.update_one({"_id": ObjectId(product_id)}, {"$set": update_dict})
    update_dict["_id"] = product_id
    return update_dict

@router.patch("/{product_id}/stock")
def update_product_stock(product_id: str, quantity: float, db=Depends(get_db), current_user=Depends(get_current_farmer)):
    """Quick stock update endpoint."""
    products_col = db["products"]
    try:
        result = products_col.update_one(
            {"_id": ObjectId(product_id), "farmer_id": current_user["_id"]},
            {"$set": {"quantity": quantity}}
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product ID")
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found or unauthorized")
    return {"message": "Stock updated", "quantity": quantity}

@router.delete("/{product_id}")
def delete_product(product_id: str, db=Depends(get_db), current_user=Depends(get_current_farmer)):
    products_col = db["products"]
    try:
        result = products_col.delete_one({"_id": ObjectId(product_id), "farmer_id": current_user["_id"]})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product ID")

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found or unauthorized")

    return {"message": "Product deleted successfully"}
