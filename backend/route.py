from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from flask_jwt_extended import (
    create_access_token, jwt_required,
    verify_jwt_in_request
)
from models import db, Recipe, Step
from werkzeug.utils import secure_filename
from datetime import datetime
import uuid
import os

routes = Blueprint('routes', __name__)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# ======= CREATE ======= #
@routes.route("/recipes", methods=["POST"])
def create_recipe():
    title = request.form.get("title")
    description = request.form.get("description")
    cover_image = request.files.get("coverImage")
    step_images = request.files.getlist("stepImages")
    step_texts = request.form.getlist("stepTexts")

    cover_image_path = None
    if cover_image:
        filename = f"{uuid.uuid4().hex}_{secure_filename(cover_image.filename)}"
        cover_image.save(os.path.join(UPLOAD_FOLDER, filename))
        cover_image_path = filename

    new_recipe = Recipe(
        title=title,
        description=description,
        cover_image_path=cover_image_path
    )
    db.session.add(new_recipe)
    db.session.commit()

    for i, text in enumerate(step_texts):
        step_image = step_images[i] if i < len(step_images) else None
        image_path = None
        if step_image:
            step_filename = f"{uuid.uuid4().hex}_{secure_filename(step_image.filename)}"
            step_image.save(os.path.join(UPLOAD_FOLDER, step_filename))
            image_path = step_filename

        step = Step(
            recipe_id=new_recipe.id,
            step_number=i + 1,
            image_path=image_path,
            text=text
        )
        db.session.add(step)

    db.session.commit()

    return jsonify({"success": True, "message": "Recipe saved!"})



# ======= READ ======= #
@routes.route('/recipes', methods=['GET'])
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


@routes.route("/recipes/<int:id>")
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


@routes.route("/recipes/popular", methods=["GET"])
def popular_recipe():
    recipes = Recipe.query.order_by(Recipe.likes.desc()).limit(6).all()
    output = []
    for r in recipes:
        output.append({
            "id": r.id,
            "title": r.title,
            "description": r.description,
            "likes": r.likes
        })
    return jsonify(output)


@routes.route('/recipes/latest')
def get_latest_recipes():
    recipes = Recipe.query.order_by(Recipe.id.desc()).limit(6).all()
    result = []
    for recipe in recipes:
        result.append({
            "id": recipe.id,
            "title": recipe.title,
            "description": recipe.description,
        })
    return jsonify(result)


# ======= UPDATE ======= #
@routes.route('/recipes/<int:id>', methods=["PUT"])
@cross_origin()
@jwt_required()
def update_recipe(id):
    recipe = Recipe.query.get_or_404(id)

    title = request.form.get("title")
    description = request.form.get("description")

    if title:
        recipe.title = title
    if description:
        recipe.description = description

    cover_image = request.files.get('coverImage')
    if cover_image:
        filename = f"{uuid.uuid4().hex}_{secure_filename(cover_image.filename)}"
        cover_image.save(os.path.join(UPLOAD_FOLDER, filename))
        recipe.cover_image_path = filename

    Step.query.filter_by(recipe_id=recipe.id).delete()

    step_texts = request.form.getlist('stepTexts')
    step_images = request.files.getlist('stepImages')

    for idx, step_text in enumerate(step_texts):
        image_path = None
        if idx < len(step_images):
            step_image = step_images[idx]
            if step_image:
                step_filename = f"{uuid.uuid4().hex}_{secure_filename(step_image.filename)}"
                step_image.save(os.path.join(UPLOAD_FOLDER, step_filename))
                image_path = step_filename

        step = Step(
            recipe_id=recipe.id,
            step_number=idx + 1,
            image_path=image_path,
            text=step_text
        )
        db.session.add(step)

    db.session.commit()
    return jsonify({'message': 'Recipe updated successfully'})


# ======= DELETE ======= #
@routes.route('/recipes/<int:id>', methods=["DELETE"])
@cross_origin()
@jwt_required()
def delete_recipe(id):
    recipe = Recipe.query.get(id)
    if not recipe:
        return jsonify({"msg": "Recipe not found"}), 404

    db.session.delete(recipe)
    db.session.commit()
    return jsonify({"msg": f"Deleted recipe {id}"})


# ======= LIKE ======= #
@routes.route('/recipes/<int:id>/like', methods=["POST", "OPTIONS"])
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

    return jsonify({
        "msg": f"Liked recipe {id}",
        "likes": recipe.likes
    })


# ======= LOGIN ======= #
@routes.route("/login", methods=['POST'])
@cross_origin()
def login():
    username = request.json.get('username')
    password = request.json.get('password')

    if username != 'test' or password != 'test':
        return jsonify({'msg': 'Bad credentials'}), 401

    access_token = create_access_token(identity=username)
    return jsonify(access_token=access_token)


# ======= STEP ONLY CREATE ======= #
@routes.route('/recipes/<int:id>/steps', methods=["POST"])
@cross_origin()
@jwt_required()
def add_step(id):
    recipe = Recipe.query.get_or_404(id)

    step_text = request.form.get('stepText')
    step_image = request.files.get('stepImage')

    image_path = None
    if step_image:
        filename = f"{uuid.uuid4().hex}_{secure_filename(step_image.filename)}"
        step_image.save(os.path.join(UPLOAD_FOLDER, filename))
        image_path = filename

    step_number = len(recipe.steps) + 1

    step = Step(
        recipe_id=recipe.id,
        step_number=step_number,
        image_path=image_path,
        text=step_text
    )
    db.session.add(step)
    db.session.commit()

    return jsonify({"msg": "Step added", "step_number": step_number})
