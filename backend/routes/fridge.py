from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, FridgeItem
from datetime import datetime, timezone

routes_fridge = Blueprint('routes_fridge',__name__)

@routes_fridge.route("/fridge", methods=["GET"])
@cross_origin()
@jwt_required()
def get_fridge():
    user_id = get_jwt_identity()
    items = FridgeItem.query.filter_by(user_id=user_id).all()
    return jsonify([item.to_dict() for item in items]), 200

@routes_fridge.route("/fridge", methods=["POST"])
@cross_origin()
@jwt_required()
def add_fridge_item():
    user_id = get_jwt_identity()
    data = request.json

    name = data.get('name')
    quantity = data.get('quantity')
    unit = data.get('unit')
    expiry_data = data.get("expiry_date")

    if not name or quantity is None or not unit:
        return jsonify({'error': '필수 값 없음'}), 400
    
    item = FridgeItem(
        user_id = user_id,
        name = name,
        quantity = quantity,
        unit = unit,
        expiry_date = datetime.fromisoformat(expiry_data) if expiry_data else None
    )
    db.session.add(item)
    db.session.commit()

    return jsonify(item.to_dict()), 201

@routes_fridge.route("/fridge/<int:item_id>", methods=["PUT"])
@cross_origin()
@jwt_required()
def update_fridge_item(item_id):
    user_id = get_jwt_identity()
    item = FridgeItem.query.get_or_404(item_id)

    if item.user_id != user_id:
        return jsonify({"error": "Unauthorized"}), 403
    
    data = request.json
    item.name = data.get("name", item.name)
    item.quantity = data.get("quantity", item.quantity)
    item.unit = data.get("unit", item.unit)

    expiry_date = data.get("expiry_date")
    if expiry_date:
        item.expiry_date = datetime.fromisoformat(expiry_date)

    db.session.commit()
    return jsonify(item.to_dict()), 200

@routes_fridge.route("/fridge/<int:item_id>", methods=["DELETE"])
@cross_origin()
@jwt_required()
def delete_fridge_item(item_id):
    user_id = get_jwt_identity()
    item = FridgeItem.query.get_or_404(item_id)

    if item.user_id != user_id:
        return jsonify({"error":"Unauthorized!"}), 403

    db.session.delete(item)
    db.session.commit()

    return jsonify({"result": "Deleted"}), 200



