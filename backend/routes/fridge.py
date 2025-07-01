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