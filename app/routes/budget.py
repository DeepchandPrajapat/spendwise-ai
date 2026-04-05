from flask import Blueprint, request, jsonify
from ..models import Budget
from ..extensions import db

budget_bp = Blueprint("budget", __name__)

@budget_bp.route("/api/budget", methods=["POST"])
def set_budget():
    data = request.json

    amount = data.get("amount")
    month = data.get("month")
    year = data.get("year")

    budget = Budget.query.filter_by(month=month, year=year).first()

    if budget:
        budget.amount = amount
    else:
        budget = Budget(amount=amount, month=month, year=year)
        db.session.add(budget)

    db.session.commit()

    return jsonify({"message": "Budget saved"})      

@budget_bp.route("/api/budget", methods=["GET"])
def get_budget():
    month = request.args.get("month", type=int)
    year = request.args.get("year", type=int)

    budget = Budget.query.filter_by(month=month, year=year).first()

    if budget:
        return jsonify({"amount": budget.amount})
    else:
        return jsonify({"amount": 0})  

@budget_bp.route("/api/budget/history", methods=["GET"])
def get_budget_history():
    # get all budgets ordered by year and month
    budgets = Budget.query.order_by(Budget.year.desc(), Budget.month.desc()).all()

    if not budgets:
        return jsonify([])

    # get all expenses
    from ..models import Expense
    expenses = Expense.query.all()

    result = []
    for budget in budgets:
        # filter expenses for this month and year
        monthly_expenses = [
            e for e in expenses
            if e.created_at.month == budget.month
            and e.created_at.year == budget.year
        ]

        total_spent = sum(e.amount for e in monthly_expenses)
        percent = (total_spent / budget.amount * 100) if budget.amount > 0 else 0

        # month name
        month_names = [
            "January", "February", "March", "April",
            "May", "June", "July", "August",
            "September", "October", "November", "December"
        ]
        month_name = month_names[budget.month - 1]

        result.append({
            "month": budget.month,
            "year": budget.year,
            "month_name": month_name,
            "budget": budget.amount,
            "spent": total_spent,
            "percent": round(percent, 1)
        })

    return jsonify(result)    