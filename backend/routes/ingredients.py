from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Ingredient
from datetime import datetime, timezone

routes_ingredients = Blueprint('routes_ingredients',__name__)

@routes_ingredients.route("/fridge", methods=["GET", "OPTIONS"])
@cross_origin()
@jwt_required(optional=True)
def get_fridge():
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS preflight response"}), 200

    user_id = get_jwt_identity()
    items = Ingredient.query.filter_by(user_id=user_id, type="fridge").all()
    return jsonify([item.to_dict() for item in items]), 200

@routes_ingredients.route("/pantry", methods=["GET", "OPTIONS"])
@cross_origin()
@jwt_required(optional=True)
def get_pantry():
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS preflight response"}), 200
    
    user_id = get_jwt_identity()
    items = Ingredient.query.filter_by(user_id=user_id, type="pantry").all()
    return jsonify([item.to_dict() for item in items]), 200


@routes_ingredients.route("/ingredients", methods=["POST"])
@cross_origin()
@jwt_required()
def add_ingredients_item():
    user_id = get_jwt_identity()
    data = request.json

    name = data.get('name')
    quantity = data.get('quantity')
    unit = data.get('unit')
    expiry_data = data.get("expiry_date")
    type = data.get("type")

    if not name or quantity is None or not unit or not type:
        return jsonify({'error': '필수 값 없음'}), 400
    
    item = Ingredient(
        user_id = user_id,
        name = name,
        quantity = quantity,
        unit = unit,
        type = type,
        expiry_date = datetime.fromisoformat(expiry_data) if expiry_data else None
    )
    db.session.add(item)
    db.session.commit()

    return jsonify(item.to_dict()), 201

@routes_ingredients.route("/ingredients/<int:item_id>", methods=["PUT"])
@cross_origin()
@jwt_required()
def update_ingredients_item(item_id):
    user_id = get_jwt_identity()
    item = Ingredient.query.get_or_404(item_id)

    if item.user_id != user_id:
        return jsonify({"error": "Unauthorized"}), 403
    
    data = request.json
    item.name = data.get("name", item.name)
    item.quantity = data.get("quantity", item.quantity)
    item.unit = data.get("unit", item.unit)
    item.type = data.get("type", item.type)

    expiry_date = data.get("expiry_date")
    if expiry_date:
        item.expiry_date = datetime.fromisoformat(expiry_date)

    db.session.commit()
    return jsonify(item.to_dict()), 200

@routes_ingredients.route("/ingredients/<int:item_id>", methods=["DELETE"])
@cross_origin()
@jwt_required()
def delete_ingredients_item(item_id):
    user_id = get_jwt_identity()
    item = Ingredient.query.get_or_404(item_id)

    if item.user_id != user_id:
        return jsonify({"error":"Unauthorized!"}), 403

    db.session.delete(item)
    db.session.commit()

    return jsonify({"result": "Deleted"}), 200



