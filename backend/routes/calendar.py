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
    year = int(request.args.get("year"))
    month = int(request.args.get("month"))

    entries = CalendarEntry.query.filter(
        CalendarEntry.user_id == user_id,
        db.extract('year', CalendarEntry.date) == year,
        db.extract('month', CalendarEntry.date) == month + 1  # JS는 0-index, SQL은 1-index
    ).all()

    return jsonify({"entries": [e.serialize() for e in entries]})


@calendar_bp.route("/calendar/random", methods=["POST"])
@jwt_required()
def random_calendar():
    user_id = get_jwt_identity()
    data = request.get_json()
    dates = data.get("dates", [])

    if not dates:
        return jsonify({"error": "No dates provided"}), 400

    recipes = Recipe.query.all()
    if not recipes:
        return jsonify({"error": "No recipes available"}), 404

    for d in dates:
        db.session.query(CalendarEntry).filter_by(user_id=user_id, date=d).delete()

    for d in dates:
        random_recipe = random.choice(recipes)
        entry = CalendarEntry(
            user_id=user_id,
            recipe_id=random_recipe.id,
            date=datetime.strptime(d, "%Y-%m-%d").date()
        )
        db.session.add(entry)

    db.session.commit()
    entries = CalendarEntry.query.filter_by(user_id=user_id).all()
    return jsonify({"entries": [e.serialize() for e in entries]})
