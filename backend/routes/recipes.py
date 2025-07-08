from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from flask_jwt_extended import jwt_required, verify_jwt_in_request
from models import db, Recipe, Step, CalendarEntry
from werkzeug.utils import secure_filename
import uuid
import os

routes_recipes = Blueprint('routes_recipes', __name__)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@routes_recipes.route("/recipes", methods=["POST"])
def create_recipe():
    title = request.form.get("title", "").strip()
    description = request.form.get("description", "").strip()
    cover_image_url = request.form.get("coverImageUrl", "").strip()
    step_image_urls = request.form.getlist("stepImageUrls")
    step_texts = request.form.getlist("stepTexts")

    if not title:
        return jsonify({"success": False, "message": "Title is required"}), 400
    if not description:
        return jsonify({"success": False, "message": "Description is required"}), 400

    new_recipe = Recipe(
        title=title,
        description=description,
        cover_image_path=cover_image_url if cover_image_url else None
    )
    db.session.add(new_recipe)
    db.session.commit()

    for i, text in enumerate(step_texts):
        text = text.strip()
        image_url = step_image_urls[i] if i < len(step_image_urls) else None

        step = Step(
            recipe_id=new_recipe.id,
            step_number=i + 1,
            image_path=image_url if image_url else None,
            text=text
        )
        db.session.add(step)

    db.session.commit()
    return jsonify({"success": True, "message": "Recipe saved!"}), 201

@routes_recipes.route('/recipes', methods=['GET'])
def get_recipes():
    recipes = Recipe.query.all()
    output = []
    for r in recipes:
        output.append({
            "id": r.id,
            "title": r.title,
            "description": r.description,
            "likes": r.likes,
            "cover_image_path": r.cover_image_path
        })
    return jsonify(output)

@routes_recipes.route("/recipes/<int:id>")
def get_recipe(id):
    recipe = Recipe.query.get_or_404(id)
    return jsonify({
        "id": recipe.id,
        "title": recipe.title,
        "description": recipe.description,
        "likes": recipe.likes,
        "cover_image_path": recipe.cover_image_path,
        "steps": [
            {
                "step_number": s.step_number,
                "image_path": s.image_path,
                "text": s.text
            } for s in recipe.steps
        ]
    })

@routes_recipes.route("/recipes/popular", methods=["GET"])
def popular_recipe():
    recipes = Recipe.query.order_by(Recipe.likes.desc()).limit(6).all()
    return jsonify([{ "id": r.id, "title": r.title, "description": r.description, "likes": r.likes } for r in recipes])

@routes_recipes.route('/recipes/latest')
def get_latest_recipes():
    recipes = Recipe.query.order_by(Recipe.id.desc()).limit(6).all()
    return jsonify([{ "id": r.id, "title": r.title, "description": r.description } for r in recipes])

@routes_recipes.route('/recipes/<int:id>', methods=["PUT"])
@cross_origin()
@jwt_required()
def update_recipe(id):
    recipe = Recipe.query.get_or_404(id)
    title = request.form.get("title", "").strip()
    description = request.form.get("description", "").strip()

    if title:
        recipe.title = title
    if description:
        recipe.description = description

    cover_image_url = request.form.get("coverImageUrl", "").strip()
    if cover_image_url:
        recipe.cover_image_path = cover_image_url

    Step.query.filter_by(recipe_id=recipe.id).delete()
    step_texts = request.form.getlist('stepTexts')
    step_image_urls = request.form.getlist('stepImageUrls')

    for idx, step_text in enumerate(step_texts):
        step_text = step_text.strip()
        image_url = step_image_urls[idx] if idx < len(step_image_urls) else None

        step = Step(
            recipe_id=recipe.id,
            step_number=idx + 1,
            image_path=image_url if image_url else None,
            text=step_text
        )
        db.session.add(step)

    db.session.commit()
    return jsonify({'message': 'Recipe updated successfully'})

@routes_recipes.route('/recipes/<int:id>', methods=["DELETE"])
@cross_origin()
@jwt_required()
def delete_recipe(id):
    recipe = Recipe.query.get(id)
    if not recipe:
        return jsonify({"msg": "Recipe not found"}), 404

    CalendarEntry.query.filter_by(recipe_id=id).delete()
    db.session.delete(recipe)
    db.session.commit()
    return jsonify({"msg": f"Deleted recipe {id}"})

@routes_recipes.route('/recipes/<int:id>/like', methods=["POST", "OPTIONS"])
@cross_origin()
def like_recipe(id):
    if request.method == "OPTIONS":
        return '', 200
    verify_jwt_in_request()
    recipe = Recipe.query.get(id)
    if not recipe:
        return jsonify({"msg": "Recipe not found"}), 404
    recipe.likes += 1
    db.session.commit()
    return jsonify({"msg": f"Liked recipe {id}", "likes": recipe.likes})

@routes_recipes.route('/recipes/<int:id>/steps', methods=["POST"])
@cross_origin()
@jwt_required()
def add_step(id):
    recipe = Recipe.query.get_or_404(id)
    step_text = request.form.get('stepText', '').strip()
    step_image_url = request.form.get('stepImageUrl', '').strip()

    step_number = len(recipe.steps) + 1
    step = Step(
        recipe_id=recipe.id,
        step_number=step_number,
        image_path=step_image_url if step_image_url else None,
        text=step_text
    )
    db.session.add(step)
    db.session.commit()
    return jsonify({"msg": "Step added", "step_number": step_number})