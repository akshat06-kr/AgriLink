import io
from reportlab.lib.pagesizes import letter, A4
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from datetime import datetime

AGRI_GREEN = colors.HexColor("#059669")
AGRI_DARK = colors.HexColor("#047857")
AGRI_LIGHT = colors.HexColor("#ecfdf5")
ACCENT = colors.HexColor("#d97706")
GREY = colors.HexColor("#64748b")
LIGHT_GREY = colors.HexColor("#f1f5f9")
RED = colors.HexColor("#dc2626")
WHITE = colors.white
BLACK = colors.HexColor("#1e293b")


def generate_earnings_pdf(farmer, earnings_data, transactions, expenses=None, products=None):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        rightMargin=40, leftMargin=40,
        topMargin=40, bottomMargin=30
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("title", parent=styles["Normal"], fontSize=22, textColor=WHITE, fontName="Helvetica-Bold", alignment=TA_LEFT)
    subtitle_style = ParagraphStyle("subtitle", parent=styles["Normal"], fontSize=10, textColor=WHITE, fontName="Helvetica", alignment=TA_LEFT)
    section_style = ParagraphStyle("section", parent=styles["Normal"], fontSize=13, textColor=AGRI_DARK, fontName="Helvetica-Bold", spaceBefore=14, spaceAfter=6)
    body_style = ParagraphStyle("body", parent=styles["Normal"], fontSize=9, textColor=BLACK, fontName="Helvetica", spaceAfter=3)
    label_style = ParagraphStyle("label", parent=styles["Normal"], fontSize=8, textColor=GREY, fontName="Helvetica")
    profit_style = ParagraphStyle("profit", parent=styles["Normal"], fontSize=11, textColor=AGRI_GREEN, fontName="Helvetica-Bold")
    loss_style = ParagraphStyle("loss", parent=styles["Normal"], fontSize=11, textColor=RED, fontName="Helvetica-Bold")

    elements = []

    # ── Banner ─────────────────────────────────────────────────────────────
    banner_data = [[
        Paragraph("🌾 AgriLink", title_style),
        Paragraph(f"Business Report<br/><font size='9'>Generated: {datetime.now().strftime('%d %b %Y, %H:%M')}</font>", subtitle_style)
    ]]
    banner_table = Table(banner_data, colWidths=[220, 280])
    banner_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), AGRI_GREEN),
        ("TOPPADDING", (0, 0), (-1, -1), 16),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 16),
        ("LEFTPADDING", (0, 0), (0, -1), 20),
        ("RIGHTPADDING", (-1, 0), (-1, -1), 20),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    elements.append(banner_table)
    elements.append(Spacer(1, 16))

    # ── Farmer Details ─────────────────────────────────────────────────────
    elements.append(Paragraph("Farmer Details", section_style))
    elements.append(HRFlowable(width="100%", thickness=1, color=AGRI_GREEN, spaceAfter=8))

    farm_details = farmer.get("farm_details", {}) or {}
    info_data = [
        ["Name:", farmer.get("name", "N/A"), "Farm:", farm_details.get("farm_name", "N/A")],
        ["Email:", farmer.get("email", "N/A"), "Location:", farm_details.get("farm_location", "N/A")],
        ["Phone:", farmer.get("phone", "N/A"), "Farming Type:", farm_details.get("farming_type", "N/A")],
    ]
    info_table = Table(info_data, colWidths=[70, 165, 70, 165])
    info_table.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("TEXTCOLOR", (0, 0), (0, -1), GREY),
        ("TEXTCOLOR", (2, 0), (2, -1), GREY),
        ("TEXTCOLOR", (1, 0), (1, -1), BLACK),
        ("TEXTCOLOR", (3, 0), (3, -1), BLACK),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("BACKGROUND", (0, 0), (-1, -1), LIGHT_GREY),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [WHITE, LIGHT_GREY]),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 16))

    # ── Financial Summary ──────────────────────────────────────────────────
    elements.append(Paragraph("Financial Summary", section_style))
    elements.append(HRFlowable(width="100%", thickness=1, color=AGRI_GREEN, spaceAfter=8))

    total_expenses = earnings_data.get("total_expenses", 0)
    total_revenue = earnings_data.get("total_earnings", earnings_data.get("total_revenue", 0))
    net_profit = total_revenue - total_expenses
    is_profit = net_profit >= 0

    summary_data = [
        ["Metric", "Amount"],
        ["Total Revenue (Delivered Orders)", f"₹{total_revenue:,.2f}"],
        ["Total Expenses", f"₹{total_expenses:,.2f}"],
        ["Net Profit / Loss", f"{'₹' + f'{net_profit:,.2f}' if is_profit else '-₹' + f'{abs(net_profit):,.2f}'}"],
        ["Completed Orders", str(earnings_data.get("completed_orders", 0))],
        ["Profit Margin", f"{round(net_profit / total_revenue * 100, 1) if total_revenue > 0 else 0}%"],
    ]
    summary_table = Table(summary_data, colWidths=[330, 140])
    summary_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), AGRI_GREEN),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("ALIGN", (1, 0), (1, -1), "RIGHT"),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (0, -1), 10),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_GREY]),
        ("TEXTCOLOR", (1, 3), (1, 3), AGRI_GREEN if is_profit else RED),
        ("FONTNAME", (0, 3), (-1, 3), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 16))

    # ── Expense Breakdown ──────────────────────────────────────────────────
    if expenses:
        elements.append(Paragraph("Expense Breakdown", section_style))
        elements.append(HRFlowable(width="100%", thickness=1, color=AGRI_GREEN, spaceAfter=8))

        from collections import defaultdict
        by_cat = defaultdict(float)
        for e in expenses:
            by_cat[e.get("category", "Other")] += float(e.get("amount", 0))

        exp_data = [["Category", "Amount"]]
        for cat, amt in sorted(by_cat.items(), key=lambda x: -x[1]):
            exp_data.append([cat, f"₹{amt:,.2f}"])
        exp_data.append(["TOTAL", f"₹{total_expenses:,.2f}"])

        exp_table = Table(exp_data, colWidths=[330, 140])
        exp_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), AGRI_DARK),
            ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
            ("BACKGROUND", (0, -1), (-1, -1), AGRI_LIGHT),
            ("TEXTCOLOR", (0, -1), (-1, -1), AGRI_DARK),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("ALIGN", (1, 0), (1, -1), "RIGHT"),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING", (0, 0), (0, -1), 10),
            ("ROWBACKGROUNDS", (0, 1), (-1, -2), [WHITE, LIGHT_GREY]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ]))
        elements.append(exp_table)
        elements.append(Spacer(1, 16))

    # ── Product Performance ────────────────────────────────────────────────
    if products:
        elements.append(Paragraph("Product Performance", section_style))
        elements.append(HRFlowable(width="100%", thickness=1, color=AGRI_GREEN, spaceAfter=8))
        prod_data = [["Product", "Units Sold", "Revenue", "Est. Profit"]]
        for p in products[:10]:
            prod_data.append([
                p.get("name", "")[:30],
                f"{p.get('units_sold', 0)} {p.get('unit', 'kg')}",
                f"₹{float(p.get('revenue', 0)):,.2f}",
                f"₹{float(p.get('profit', 0)):,.2f}",
            ])
        prod_table = Table(prod_data, colWidths=[200, 80, 100, 90])
        prod_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), AGRI_DARK),
            ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 8.5),
            ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING", (0, 0), (0, -1), 10),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_GREY]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ]))
        elements.append(prod_table)
        elements.append(Spacer(1, 16))

    # ── Recent Transactions ────────────────────────────────────────────────
    elements.append(Paragraph("Recent Transactions", section_style))
    elements.append(HRFlowable(width="100%", thickness=1, color=AGRI_GREEN, spaceAfter=8))

    tx_data = [["Date", "Transaction ID", "Type", "Description", "Amount", "Status"]]
    for tx in transactions[:20]:
        sign = "-" if tx.get("type") == "Expense" else "+"
        if isinstance(tx, dict):
            amt = float(tx.get("total_amount", tx.get("amount", 0)))
            tid = "ORD-" + str(tx.get("_id", tx.get("id", "")))[-6:].upper()
            desc = ""
            items = tx.get("items", [])
            if items:
                desc = items[0].get("product_name", "Order")[:20]
            typ = tx.get("type", "Sale")
            status = tx.get("order_status", tx.get("status", ""))
            dt = tx.get("created_at", "")
            if hasattr(dt, "strftime"):
                dt = dt.strftime("%d %b %Y")
            elif isinstance(dt, str) and len(dt) >= 10:
                try:
                    dt = datetime.fromisoformat(dt[:10]).strftime("%d %b %Y")
                except Exception:
                    dt = dt[:10]
            tx_data.append([dt, tid, typ, desc, f"{sign}₹{amt:,.2f}", status])

    tx_table = Table(tx_data, colWidths=[65, 75, 50, 155, 65, 60])
    tx_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), AGRI_GREEN),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 7.5),
        ("ALIGN", (4, 0), (4, -1), "RIGHT"),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (0, -1), 8),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_GREY]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
    ]))
    elements.append(tx_table)
    elements.append(Spacer(1, 20))

    # Footer
    elements.append(HRFlowable(width="100%", thickness=0.5, color=GREY))
    elements.append(Spacer(1, 6))
    elements.append(Paragraph(
        "This report was generated by AgriLink. All financial data is based on recorded transactions and expenses.",
        ParagraphStyle("footer", parent=styles["Normal"], fontSize=7, textColor=GREY, alignment=TA_CENTER)
    ))

    doc.build(elements)
    pdf = buffer.getvalue()
    buffer.close()
    return pdf
