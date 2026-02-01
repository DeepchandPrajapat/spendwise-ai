from flask import Blueprint, request, jsonify
from ..models import Expense
from ..extensions import db

expenses_bp = Blueprint(
    "expenses",
    __name__,
    url_prefix="/api/expenses"
)

@expenses_bp.route("/", methods=["POST"])
def create_expense():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    amount = data.get("amount")
    category = data.get("category")
    description = data.get("description")

    if not amount or not category:
        return jsonify({"error": "Amount and category are required"}), 400

    expense = Expense(
        amount=amount,
        category=category,
        description=description
    )

    db.session.add(expense)
    db.session.commit()

    return jsonify({
        "message": "Expense created successfully",
        "id": expense.id
    }), 201
    
@expenses_bp.route("/",methods=["GET"])
def get_all_expenses():
    expenses = Expense.query.all()

    result = []
    for expense in expenses:
        result.append({
            "id": expense.id,
            "amount": expense.amount,
            "category": expense.category,
            "description": expense.description,
            "created_at": expense.created_at.isoformat(),
            "updated_at": expense.updated_at.isoformat()
        })

    return jsonify(result), 200

@expenses_bp.route("/<int:expense_id>",methods=["GET"])
def get_expense(expense_id):
    expense = Expense.query.get(expense_id)
    
    if not expense:
        return jsonify({"error": "Expense not found"}), 404
    
    return jsonify({
    "id": expense.id,
    "amount": expense.amount,
    "category": expense.category,
    "description": expense.description,
    "created_at": expense.date.isoformat(),
    "updated_at": expense.date.isoformat()
}), 200

@expenses_bp.route("/<int:expense_id>", methods=["PATCH"])
def update_expense(expense_id):
    expense = Expense.query.get(expense_id)

    if not expense:
        return jsonify({"error": "Expense not found"}), 404

    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    expense.amount = data.get("amount", expense.amount)
    expense.category = data.get("category", expense.category)
    expense.description = data.get("description", expense.description)

    db.session.commit()

    return jsonify({"message": "Expense updated successfully"}), 200

@expenses_bp.route("/<int:expense_id>", methods=["DELETE"])
def delete_expense(expense_id):
    expense = Expense.query.get(expense_id)
    
    if not expense:
        return jsonify({"error": "Expense not found"}), 404
    
    db.session.delete(expense)
    db.session.commit()
    
    return jsonify({"message": "Expense deleted successfully"}), 200



    