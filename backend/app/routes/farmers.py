from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from bson import ObjectId
from datetime import datetime, timedelta
from collections import defaultdict
from app.config.database import get_db
from app.models.schemas import ProductResponse
from app.utils.deps import get_current_user, get_current_farmer

router = APIRouter()

# ─── Public Farmer Profile ────────────────────────────────────────────────────

@router.get("/{farmer_id}/public")
def get_farmer_profile(farmer_id: str, db=Depends(get_db)):
    users_col = db["users"]
    products_col = db["products"]

    try:
        farmer = users_col.find_one({"_id": ObjectId(farmer_id), "role": "FARMER"})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid farmer ID")

    if not farmer:
        product = products_col.find_one({"farmer_id": farmer_id})
        if product:
            return {
                "id": farmer_id,
                "name": product.get("farmer_name", "Local Farmer"),
                "farm_name": product.get("farm_name", "Certified Family Farm"),
                "location": product.get("location", "India"),
                "farming_type": product.get("farming_type", "Organic / Natural"),
                "avatar": product.get("farmer_avatar"),
                "bio": product.get("farmer_bio", "Dedicated to sustainable agriculture."),
                "rating": 4.9,
                "verified": True,
                "product_count": products_col.count_documents({"farmer_id": farmer_id})
            }
        raise HTTPException(status_code=404, detail="Farmer not found")

    farm_details = farmer.get("farm_details", {})
    product_count = products_col.count_documents({"farmer_id": farmer_id})

    return {
        "id": str(farmer["_id"]),
        "name": farmer.get("name"),
        "email": farmer.get("email"),
        "phone": farmer.get("phone"),
        "farm_name": farm_details.get("farm_name", "AgriLink Partner Farm"),
        "location": farm_details.get("farm_location", "India"),
        "farming_type": farm_details.get("farming_type", "Organic"),
        "crop_categories": farm_details.get("crop_categories", []),
        "bio": farm_details.get("farm_description", "Committed to fresh produce."),
        "rating": 4.9,
        "verified": True,
        "product_count": product_count
    }

@router.get("/{farmer_id}/products", response_model=List[ProductResponse])
def get_farmer_products_public(farmer_id: str, db=Depends(get_db)):
    products_col = db["products"]
    products = list(products_col.find({"farmer_id": farmer_id, "status": "approved"}))
    for p in products:
        p["_id"] = str(p["_id"])
    return products

# ─── Authenticated Farmer Profile ─────────────────────────────────────────────

@router.get("/me/profile")
def get_my_profile(db=Depends(get_db), current_user=Depends(get_current_farmer)):
    farm_details = current_user.get("farm_details", {})
    return {
        "id": current_user["_id"],
        "name": current_user.get("name"),
        "email": current_user.get("email"),
        "phone": current_user.get("phone"),
        "farm_name": farm_details.get("farm_name", "AgriLink Partner Farm"),
        "location": farm_details.get("farm_location", "India"),
        "farming_type": farm_details.get("farming_type", "Organic"),
        "crop_categories": farm_details.get("crop_categories", []),
        "farm_description": farm_details.get("farm_description", ""),
    }

@router.patch("/me/profile")
def update_my_profile(data: dict, db=Depends(get_db), current_user=Depends(get_current_farmer)):
    users_col = db["users"]
    update_fields = {}
    # Allow updating top-level fields
    for field in ["name", "phone"]:
        if field in data:
            update_fields[field] = data[field]
    # Allow updating farm_details sub-fields
    farm_fields = ["farm_name", "farm_location", "farming_type", "crop_categories", "farm_description"]
    farm_update = {}
    for field in farm_fields:
        if field in data:
            farm_update[f"farm_details.{field}"] = data[field]
    update_fields.update(farm_update)
    if update_fields:
        users_col.update_one({"_id": ObjectId(current_user["_id"])}, {"$set": update_fields})
    return {"message": "Profile updated successfully"}

# ─── Dashboard Aggregation ────────────────────────────────────────────────────

@router.get("/me/dashboard")
def get_farmer_dashboard(db=Depends(get_db), current_user=Depends(get_current_farmer)):
    farmer_id = current_user["_id"]
    orders_col = db["orders"]
    expenses_col = db["expenses"]
    products_col = db["products"]

    now = datetime.utcnow()
    today = now.date()

    # ── Fetch all farmer orders ──────────────────────────────────────────
    all_orders = list(orders_col.find({"farmer_id": farmer_id}).sort("created_at", -1))
    for o in all_orders:
        o["_id"] = str(o["_id"])

    # Revenue = only from Delivered orders (realized income)
    delivered_orders = [o for o in all_orders if o.get("order_status") == "Delivered"]
    cancelled_orders = [o for o in all_orders if o.get("order_status") == "Cancelled"]
    pending_orders = [o for o in all_orders if o.get("order_status") not in ("Delivered", "Cancelled")]

    total_revenue = sum(float(o.get("total_amount", 0)) for o in delivered_orders)
    pending_payments = sum(float(o.get("total_amount", 0)) for o in all_orders if o.get("payment_status") == "Pending")

    # ── Fetch all farmer expenses ────────────────────────────────────────
    all_expenses = list(expenses_col.find({"farmer_id": farmer_id}))
    for e in all_expenses:
        e["_id"] = str(e["_id"])

    total_expenses = sum(float(e.get("amount", 0)) for e in all_expenses)
    net_profit = total_revenue - total_expenses

    # ── This month / last month calculations ─────────────────────────────
    this_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    last_month_end = this_month_start - timedelta(seconds=1)
    last_month_start = last_month_end.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    def order_amount_in_range(orders, start, end):
        return sum(
            float(o.get("total_amount", 0)) for o in orders
            if o.get("order_status") == "Delivered"
            and o.get("created_at") and _to_dt(o["created_at"]) >= start
            and _to_dt(o["created_at"]) <= end
        )

    def expense_amount_in_range(expenses, start, end):
        return sum(
            float(e.get("amount", 0)) for e in expenses
            if e.get("date") and _date_in_range(e["date"], start.date(), end.date())
        )

    this_month_revenue = order_amount_in_range(all_orders, this_month_start, now)
    last_month_revenue = order_amount_in_range(all_orders, last_month_start, last_month_end)
    this_month_expenses = expense_amount_in_range(all_expenses, this_month_start, now)
    last_month_expenses = expense_amount_in_range(all_expenses, last_month_start, last_month_end)
    this_month_profit = this_month_revenue - this_month_expenses
    last_month_profit = last_month_revenue - last_month_expenses

    month_change_pct = _pct_change(last_month_revenue, this_month_revenue)

    # ── Last week / previous week ─────────────────────────────────────────
    week_start = now - timedelta(days=now.weekday() + 7)  # Monday of last week
    week_end = week_start + timedelta(days=6, hours=23, minutes=59, seconds=59)
    prev_week_start = week_start - timedelta(days=7)
    prev_week_end = week_start - timedelta(seconds=1)

    lw_revenue = order_amount_in_range(all_orders, week_start, week_end)
    lw_expenses = expense_amount_in_range(all_expenses, week_start, week_end)
    lw_profit = lw_revenue - lw_expenses
    lw_orders = sum(1 for o in all_orders if o.get("created_at") and _to_dt(o["created_at"]) >= week_start and _to_dt(o["created_at"]) <= week_end)
    lw_units = _count_units_in_orders([o for o in all_orders if o.get("created_at") and _to_dt(o["created_at"]) >= week_start and _to_dt(o["created_at"]) <= week_end])

    pw_revenue = order_amount_in_range(all_orders, prev_week_start, prev_week_end)
    pw_expenses = expense_amount_in_range(all_expenses, prev_week_start, prev_week_end)
    pw_profit = pw_revenue - pw_expenses

    # ── Chart data — last 6 months ────────────────────────────────────────
    chart_data = _build_chart_data(all_orders, all_expenses, 6)

    # ── Product performance ───────────────────────────────────────────────
    my_products = list(products_col.find({"farmer_id": farmer_id}))
    for p in my_products:
        p["_id"] = str(p["_id"])

    product_stats = _compute_product_stats(my_products, delivered_orders)

    # ── Price transparency & High/Low Market Comparisons ──────────────────
    price_comparisons = []
    approved_products = [p for p in my_products if p.get("status") == "approved"]
    
    for p in (approved_products if approved_products else my_products):
        price = float(p.get("price", 0))
        mkt_price = float(p.get("market_price") or (price * 1.25))
        prod_cost = float(p.get("production_cost") or (price * 0.55))
        
        # Mandi low price (wholesale floor) and Retail high price (supermarket ceiling)
        mandi_low = round(float(p.get("mandi_low") or (mkt_price * 0.76 if mkt_price > 0 else price * 0.8)), 2)
        retail_high = round(float(p.get("retail_high") or (mkt_price * 1.45 if mkt_price > 0 else price * 1.5)), 2)
        
        diff = round(mkt_price - price, 2)
        farmer_boost = round(price - mandi_low, 2)
        farmer_boost_pct = round(((price - mandi_low) / mandi_low) * 100, 1) if mandi_low > 0 else 0
        consumer_savings = round(retail_high - price, 2)
        consumer_savings_pct = round(((retail_high - price) / retail_high) * 100, 1) if retail_high > 0 else 0
        profit_per_unit = round(price - prod_cost, 2)
        margin_pct = round((profit_per_unit / price * 100), 1) if price > 0 else 0
        
        price_comparisons.append({
            "product_id": p["_id"],
            "name": p.get("name", "Crop"),
            "category": p.get("category", "General"),
            "unit": p.get("unit", "kg"),
            "image": (p.get("images") or [p.get("image", "")])[0] if p.get("images") else p.get("image", ""),
            "your_price": price,
            "production_cost": prod_cost,
            "mandi_low": mandi_low,
            "market_price": mkt_price,
            "retail_high": retail_high,
            "difference": diff,
            "farmer_boost": farmer_boost,
            "farmer_boost_pct": farmer_boost_pct,
            "consumer_savings": consumer_savings,
            "consumer_savings_pct": consumer_savings_pct,
            "profit_per_unit": profit_per_unit,
            "margin_pct": margin_pct,
            "quantity": p.get("quantity", 0),
            "status": p.get("status", "approved"),
        })

    # Market Price Summary
    total_cmp = len(price_comparisons)
    avg_your_price = round(sum(i["your_price"] for i in price_comparisons) / total_cmp, 2) if total_cmp > 0 else 0
    avg_mandi_low = round(sum(i["mandi_low"] for i in price_comparisons) / total_cmp, 2) if total_cmp > 0 else 0
    avg_retail_high = round(sum(i["retail_high"] for i in price_comparisons) / total_cmp, 2) if total_cmp > 0 else 0
    avg_consumer_savings_pct = round(sum(i["consumer_savings_pct"] for i in price_comparisons) / total_cmp, 1) if total_cmp > 0 else 0
    avg_farmer_boost_pct = round(sum(i["farmer_boost_pct"] for i in price_comparisons) / total_cmp, 1) if total_cmp > 0 else 0

    price_transparency = price_comparisons

    market_intelligence = {
        "avg_your_price": avg_your_price,
        "avg_mandi_low": avg_mandi_low,
        "avg_retail_high": avg_retail_high,
        "avg_consumer_savings_pct": avg_consumer_savings_pct,
        "avg_farmer_boost_pct": avg_farmer_boost_pct,
        "total_tracked_crops": total_cmp,
    }

    # ── Recent transactions (orders + expenses merged) ────────────────────
    transactions = _build_transactions(all_orders[:20], all_expenses[:20])

    # ── Earnings breakdown ────────────────────────────────────────────────
    platform_fee_pct = 0.02  # 2% platform fee
    gross_sales = total_revenue
    platform_fees = round(gross_sales * platform_fee_pct, 2)
    net_earnings = gross_sales - platform_fees

    # ── Expense breakdown by category ────────────────────────────────────
    expense_by_category = defaultdict(float)
    for e in all_expenses:
        expense_by_category[e.get("category", "Other")] += float(e.get("amount", 0))

    # ── Last month full summary ───────────────────────────────────────────
    lm_orders_count = sum(
        1 for o in all_orders
        if o.get("created_at") and _to_dt(o["created_at"]) >= last_month_start
        and _to_dt(o["created_at"]) <= last_month_end
    )
    lm_units = _count_units_in_orders([
        o for o in all_orders
        if o.get("created_at") and _to_dt(o["created_at"]) >= last_month_start
        and _to_dt(o["created_at"]) <= last_month_end
    ])

    profit_margin = round((net_profit / total_revenue * 100), 1) if total_revenue > 0 else 0.0

    return {
        # Summary cards
        "total_revenue": round(total_revenue, 2),
        "total_expenses": round(total_expenses, 2),
        "net_profit": round(net_profit, 2),
        "pending_payments": round(pending_payments, 2),
        "this_month_earnings": round(this_month_revenue, 2),
        "last_month_earnings": round(last_month_revenue, 2),
        "month_change_pct": month_change_pct,
        "profit_margin": profit_margin,
        "total_orders": len(all_orders),
        "delivered_orders": len(delivered_orders),
        "cancelled_orders": len(cancelled_orders),

        # Chart data
        "chart_data": chart_data,

        # Last week performance
        "last_week": {
            "revenue": round(lw_revenue, 2),
            "expenses": round(lw_expenses, 2),
            "profit": round(lw_profit, 2),
            "orders": lw_orders,
            "units_sold": lw_units,
            "revenue_change_pct": _pct_change(pw_revenue, lw_revenue),
            "profit_change_pct": _pct_change(pw_profit, lw_profit),
        },

        # Last month performance
        "last_month": {
            "revenue": round(last_month_revenue, 2),
            "expenses": round(last_month_expenses, 2),
            "profit": round(last_month_profit, 2),
            "orders": lm_orders_count,
            "units_sold": lm_units,
            "profit_margin": round((last_month_profit / last_month_revenue * 100), 1) if last_month_revenue > 0 else 0,
        },

        # This month
        "this_month": {
            "revenue": round(this_month_revenue, 2),
            "expenses": round(this_month_expenses, 2),
            "profit": round(this_month_profit, 2),
        },

        # Profit & loss
        "profit_loss": {
            "gross_sales": round(gross_sales, 2),
            "total_expenses": round(total_expenses, 2),
            "net_profit": round(net_profit, 2),
            "expense_by_category": dict(expense_by_category),
            "is_profit": net_profit >= 0,
        },

        # Earnings breakdown
        "earnings": {
            "gross_sales": round(gross_sales, 2),
            "platform_fees": round(platform_fees, 2),
            "net_earnings": round(net_earnings, 2),
        },

        # Product performance
        "product_performance": product_stats[:10],
        "price_transparency": price_transparency,
        "price_comparisons": price_comparisons,
        "market_intelligence": market_intelligence,

        # Recent transactions
        "recent_transactions": transactions[:20],

        # Inventory
        "products": [_format_product_for_dashboard(p) for p in my_products],
    }


# ─── Helper Functions ──────────────────────────────────────────────────────────

def _to_dt(val):
    if isinstance(val, datetime):
        if val.tzinfo is not None:
            return val.replace(tzinfo=None)
        return val
    if isinstance(val, str):
        try:
            dt = datetime.fromisoformat(val.replace("Z", "+00:00"))
            if dt.tzinfo is not None:
                return dt.replace(tzinfo=None)
            return dt
        except Exception:
            return datetime.min
    return datetime.min

def _date_in_range(date_str: str, start, end):
    try:
        d = datetime.strptime(date_str[:10], "%Y-%m-%d").date()
        return start <= d <= end
    except Exception:
        return False

def _pct_change(old_val, new_val):
    if old_val == 0:
        return 100.0 if new_val > 0 else 0.0
    return round(((new_val - old_val) / old_val) * 100, 1)

def _count_units_in_orders(orders):
    total = 0.0
    for o in orders:
        for item in o.get("items", []):
            total += float(item.get("quantity", 0))
    return round(total, 1)

def _build_chart_data(orders, expenses, months: int):
    now = datetime.utcnow()
    result = []
    for i in range(months - 1, -1, -1):
        # Month offset
        month_dt = now - timedelta(days=30 * i)
        year = month_dt.year
        month = month_dt.month
        label = month_dt.strftime("%b")

        month_delivered_orders = [
            o for o in orders
            if o.get("order_status") == "Delivered"
            and o.get("created_at")
            and _to_dt(o["created_at"]).year == year
            and _to_dt(o["created_at"]).month == month
        ]
        month_revenue = sum(float(o.get("total_amount", 0)) for o in month_delivered_orders)
        month_expenses = sum(
            float(e.get("amount", 0)) for e in expenses
            if e.get("date") and e["date"][:7] == f"{year}-{str(month).zfill(2)}"
        )
        month_units = _count_units_in_orders(month_delivered_orders)
        month_orders_count = len(month_delivered_orders)
        month_profit = month_revenue - month_expenses
        margin_pct = round((month_profit / month_revenue * 100), 1) if month_revenue > 0 else 0

        result.append({
            "month": label,
            "year": year,
            "revenue": round(month_revenue, 2),
            "expenses": round(month_expenses, 2),
            "profit": round(month_profit, 2),
            "units_sold": month_units,
            "orders": month_orders_count,
            "margin_pct": margin_pct,
        })
    return result

def _compute_product_stats(products, delivered_orders):
    """Compute per-product revenue, units sold, profit from delivered orders."""
    stats = {}
    for p in products:
        pid = p["_id"]
        stats[pid] = {
            "product_id": pid,
            "name": p.get("name", ""),
            "image": (p.get("images") or [p.get("image", "")])[0] if p.get("images") else p.get("image", ""),
            "unit": p.get("unit", "kg"),
            "price": float(p.get("price", 0)),
            "production_cost": float(p.get("production_cost", 0)),
            "units_sold": 0.0,
            "revenue": 0.0,
            "profit": 0.0,
        }

    for order in delivered_orders:
        for item in order.get("items", []):
            pid = item.get("product_id")
            if pid in stats:
                qty = float(item.get("quantity", 0))
                price = float(item.get("price", 0))
                production_cost = float(stats[pid]["production_cost"])
                stats[pid]["units_sold"] += qty
                stats[pid]["revenue"] += qty * price
                stats[pid]["profit"] += qty * (price - production_cost)

    result = list(stats.values())
    for r in result:
        r["revenue"] = round(r["revenue"], 2)
        r["profit"] = round(r["profit"], 2)
        r["units_sold"] = round(r["units_sold"], 1)

    # Sort by revenue desc
    result.sort(key=lambda x: x["revenue"], reverse=True)
    return result

def _build_transactions(orders, expenses):
    """Merge and sort orders + expenses into a unified transaction list."""
    txns = []
    for o in orders:
        dt = _to_dt(o.get("created_at"))
        status = o.get("order_status", "Order Placed")
        if status == "Cancelled":
            txn_status = "Cancelled"
        elif status == "Delivered":
            txn_status = "Completed"
        else:
            txn_status = "Pending"

        # Get description from first item
        items = o.get("items", [])
        desc = items[0].get("product_name", "Order") if items else "Order"
        if len(items) > 1:
            desc += f" +{len(items)-1} more"

        txns.append({
            "date": dt.strftime("%d %b") if dt != datetime.min else "",
            "transaction_id": "ORD-" + o["_id"][-6:].upper(),
            "type": "Sale",
            "description": desc,
            "amount": float(o.get("total_amount", 0)),
            "status": txn_status,
            "sign": "+",
            "created_at": dt.isoformat() if dt != datetime.min else "",
        })

    for e in expenses:
        try:
            dt = datetime.strptime(e.get("date", "")[:10], "%Y-%m-%d")
        except Exception:
            dt = _to_dt(e.get("created_at"))
        txns.append({
            "date": dt.strftime("%d %b") if dt != datetime.min else "",
            "transaction_id": "EXP-" + e["_id"][-6:].upper(),
            "type": "Expense",
            "description": e.get("category", "Expense") + (f" — {e.get('description', '')}" if e.get("description") else ""),
            "amount": float(e.get("amount", 0)),
            "status": "Paid",
            "sign": "-",
            "created_at": dt.isoformat() if dt != datetime.min else "",
        })

    txns.sort(key=lambda x: x["created_at"], reverse=True)
    return txns

def _format_product_for_dashboard(p):
    return {
        "id": p["_id"],
        "name": p.get("name", ""),
        "category": p.get("category", ""),
        "price": p.get("price", 0),
        "market_price": p.get("market_price", 0),
        "production_cost": p.get("production_cost", 0),
        "quantity": p.get("quantity", 0),
        "unit": p.get("unit", "kg"),
        "image": (p.get("images") or [p.get("image", "")])[0] if p.get("images") else p.get("image", ""),
        "status": p.get("status", "approved"),
        "units_sold": p.get("units_sold", 0),
    }
