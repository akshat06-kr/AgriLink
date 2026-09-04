from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from app.models.schemas import ExpenseCreate, ExpenseResponse
from app.config.database import get_db
from app.utils.deps import get_current_farmer

router = APIRouter()

VALID_CATEGORIES = [
    "Seeds", "Fertilizer", "Pesticides", "Labour", "Transportation",
    "Packaging", "Equipment", "Platform Fees", "Other"
]

@router.post("/", response_model=ExpenseResponse)
def create_expense(expense: ExpenseCreate, db=Depends(get_db), current_user=Depends(get_current_farmer)):
    expenses_col = db["expenses"]

    if expense.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    exp_dict = expense.model_dump() if hasattr(expense, 'model_dump') else expense.dict()
    exp_dict["farmer_id"] = current_user["_id"]
    exp_dict["created_at"] = datetime.utcnow()

    result = expenses_col.insert_one(exp_dict)
    exp_dict["_id"] = str(result.inserted_id)
    return exp_dict

@router.get("/", response_model=List[ExpenseResponse])
def get_expenses(
    month: Optional[int] = None,
    year: Optional[int] = None,
    db=Depends(get_db),
    current_user=Depends(get_current_farmer)
):
    expenses_col = db["expenses"]
    query = {"farmer_id": current_user["_id"]}

    # Filter by month/year based on "date" field (string YYYY-MM-DD)
    if year and month:
        prefix = f"{year}-{str(month).zfill(2)}"
        query["date"] = {"$regex": f"^{prefix}"}
    elif year:
        query["date"] = {"$regex": f"^{year}"}

    expenses = list(expenses_col.find(query).sort("date", -1))
    for e in expenses:
        e["_id"] = str(e["_id"])
    return expenses

@router.get("/summary")
def get_expense_summary(db=Depends(get_db), current_user=Depends(get_current_farmer)):
    """Returns total expenses grouped by category (all time)."""
    expenses_col = db["expenses"]
    expenses = list(expenses_col.find({"farmer_id": current_user["_id"]}))

    summary = {}
    total = 0.0
    for e in expenses:
        cat = e.get("category", "Other")
        amt = float(e.get("amount", 0))
        summary[cat] = summary.get(cat, 0.0) + amt
        total += amt

    return {"by_category": summary, "total": total}

@router.delete("/{expense_id}")
def delete_expense(expense_id: str, db=Depends(get_db), current_user=Depends(get_current_farmer)):
    expenses_col = db["expenses"]
    try:
        result = expenses_col.delete_one({"_id": ObjectId(expense_id), "farmer_id": current_user["_id"]})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid expense ID")

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Expense not found or unauthorized")

    return {"message": "Expense deleted successfully"}
