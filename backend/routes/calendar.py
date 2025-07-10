
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, CalendarEntry, Recipe
from datetime import datetime
import random

calendar_bp = Blueprint('calendar', __name__)

@calendar_bp.route("/calendar", methods=["GET"])
@jwt_required()
def get_calendar():
    user_id = get_jwt_identity()
    print("[GET] user_id:", user_id)   

    if not user_id:
        return jsonify({"error": "Unauthorized: No user_id"}), 401

    try:
        year = int(request.args.get("year"))
        month = int(request.args.get("month"))
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid year or month"}), 400

    entries = CalendarEntry.query.filter(
        CalendarEntry.user_id == user_id,
        db.extract('year', CalendarEntry.date) == year,
        db.extract('month', CalendarEntry.date) == month  # JS는 +1 해서 오므로 +1 불필요
    ).all()

    return jsonify({"entries": [e.serialize() for e in entries]}), 200


@calendar_bp.route("/calendar/random", methods=["POST"])
@jwt_required()
def random_calendar():
    user_id = get_jwt_identity()
    print("[POST] user_id:", user_id)  # ✅ 디버깅 로그

    if not user_id:
        return jsonify({"error": "Unauthorized: No user_id"}), 401

    data = request.get_json()
    dates = data.get("dates", [])

    print("[POST] dates:", dates)

    if not dates or not isinstance(dates, list):
        return jsonify({"error": "No dates provided"}), 400

    recipes = Recipe.query.all()
    if not recipes:
        return jsonify({"error": "No recipes available"}), 404

    # 기존 일정 삭제
    for d in dates:
        try:
            dt = datetime.strptime(d, "%Y-%m-%d").date()
        except ValueError:
            return jsonify({"error": f"Invalid date format: {d}"}), 422

        db.session.query(CalendarEntry).filter_by(user_id=user_id, date=dt).delete()

    # 새 일정 생성
    for d in dates:
        random_recipe = random.choice(recipes)
        try:
            dt = datetime.strptime(d, "%Y-%m-%d").date()
        except ValueError:
            return jsonify({"error": f"Invalid date format: {d}"}), 422

        entry = CalendarEntry(
            user_id=user_id,
            recipe_id=random_recipe.id,
            date=dt
        )
        db.session.add(entry)

    db.session.commit()

    entries = CalendarEntry.query.filter_by(user_id=user_id).all()
    return jsonify({"entries": [e.serialize() for e in entries]}), 200
