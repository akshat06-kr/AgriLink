from fastapi import APIRouter, Depends, Response
import csv
import io
from collections import defaultdict
from app.config.database import get_db
from app.utils.deps import get_current_farmer
from app.services.pdf_service import generate_earnings_pdf
from app.routes.farmers import _compute_product_stats

router = APIRouter()

@router.get("/pdf")
def download_earnings_pdf(db=Depends(get_db), current_user=Depends(get_current_farmer)):
    orders_col = db["orders"]
    expenses_col = db["expenses"]
    products_col = db["products"]

    orders = list(orders_col.find({"farmer_id": current_user["_id"]}).sort("created_at", -1))
    for o in orders:
        o["_id"] = str(o["_id"])

    expenses = list(expenses_col.find({"farmer_id": current_user["_id"]}))
    for e in expenses:
        e["_id"] = str(e["_id"])

    my_products = list(products_col.find({"farmer_id": current_user["_id"]}))
    for p in my_products:
        p["_id"] = str(p["_id"])

    delivered_orders = [o for o in orders if o.get("order_status") == "Delivered"]
    total_earnings = sum(float(o.get("total_amount", 0)) for o in delivered_orders)
    total_expenses = sum(float(e.get("amount", 0)) for e in expenses)
    completed_orders = len(delivered_orders)

    product_stats = _compute_product_stats(my_products, delivered_orders)

    earnings_data = {
        "total_earnings": total_earnings,
        "total_expenses": total_expenses,
        "completed_orders": completed_orders,
    }

    # Build merged transaction list for the report
    merged = list(orders) + [{"type": "Expense", **e} for e in expenses]

    pdf_bytes = generate_earnings_pdf(
        current_user, earnings_data, merged,
        expenses=expenses, products=product_stats
    )

    headers = {'Content-Disposition': 'attachment; filename="agrilink_business_report.pdf"'}
    return Response(content=pdf_bytes, media_type="application/pdf", headers=headers)


@router.get("/csv")
def download_earnings_csv(db=Depends(get_db), current_user=Depends(get_current_farmer)):
    orders_col = db["orders"]
    expenses_col = db["expenses"]

    orders = list(orders_col.find({"farmer_id": current_user["_id"]}).sort("created_at", -1))
    expenses = list(expenses_col.find({"farmer_id": current_user["_id"]}))

    output = io.StringIO()
    writer = csv.writer(output)

    # Orders section
    writer.writerow(["=== ORDERS ==="])
    writer.writerow(["Order ID", "Customer", "Amount (₹)", "Payment Status", "Order Status", "Date"])
    for o in orders:
        dt = o.get("created_at", "")
        if hasattr(dt, "strftime"):
            dt = dt.strftime("%Y-%m-%d %H:%M:%S")
        else:
            dt = str(dt)[:19]
        writer.writerow([
            str(o["_id"])[-12:],
            o.get("customer_name", "Unknown"),
            f"{float(o.get('total_amount', 0)):.2f}",
            o.get("payment_status", ""),
            o.get("order_status", ""),
            dt
        ])

    writer.writerow([])
    writer.writerow(["=== EXPENSES ==="])
    writer.writerow(["Expense ID", "Category", "Amount (₹)", "Date", "Description"])
    total_exp = 0.0
    for e in expenses:
        amt = float(e.get("amount", 0))
        total_exp += amt
        writer.writerow([
            str(e.get("_id", ""))[-12:],
            e.get("category", ""),
            f"{amt:.2f}",
            e.get("date", ""),
            e.get("description", "")
        ])

    writer.writerow([])
    writer.writerow(["=== FINANCIAL SUMMARY ==="])
    delivered_revenue = sum(float(o.get("total_amount", 0)) for o in orders if o.get("order_status") == "Delivered")
    net_profit = delivered_revenue - total_exp
    writer.writerow(["Total Revenue (Delivered)", f"₹{delivered_revenue:.2f}"])
    writer.writerow(["Total Expenses", f"₹{total_exp:.2f}"])
    writer.writerow(["Net Profit / Loss", f"₹{net_profit:.2f}"])

    csv_str = output.getvalue()
    headers = {'Content-Disposition': 'attachment; filename="agrilink_report.csv"'}
    return Response(content=csv_str, media_type="text/csv", headers=headers)
