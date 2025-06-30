from flask import Flask
from flask_cors import CORS, cross_origin
from flask import request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity,verify_jwt_in_request
from flask_sqlalchemy import SQLAlchemy
import os
import uuid

app = Flask(__name__)

CORS(app, supports_credentials=True)

app.config['JWT_SECRET_KEY'] = 'super-secret'
jwt = JWTManager(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///recipes.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/")
def home():
    return "Hello, backend!"

import uuid

@app.route("/recipes", methods=["POST"])
def create_recipe():
    title = request.form.get("title")
    description = request.form.get("description")
    cover_image = request.files.get("coverImage")

    step_images = request.files.getlist("stepImages")
    step_texts = request.form.getlist("stepTexts")

    print("Title:", title)
    print("Description:", description)
    print("CoverImage:", cover_image)
    print("StepImages:", step_images)
    print("StepTexts:", step_texts)

    # ✅ 대표 이미지 저장
    cover_image_path = None
    if cover_image:
        filename = f"{uuid.uuid4().hex}_{cover_image.filename}"
        cover_image.save(os.path.join(UPLOAD_FOLDER, filename))
        cover_image_path = filename

    # ✅ Recipe 객체 생성
    new_recipe = Recipe(
        title=title,
        description=description,
        cover_image_path=cover_image_path
    )
    db.session.add(new_recipe)
    db.session.commit()  # 먼저 커밋해야 ID 생성됨

    # ✅ 스텝들 저장
    for i, text in enumerate(step_texts):
        step_image = step_images[i] if i < len(step_images) else None

        image_path = None
        if step_image:
            step_filename = f"{uuid.uuid4().hex}_{step_image.filename}"
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

    return jsonify({
        "success": True,
        "message": "Recipe saved!"
    })


class Recipe(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=True)
    likes = db.Column(db.Integer, default=0)
    cover_image_path = db.Column(db.String(200))

    steps= db.relationship('Step', backref='recipe', cascade='all, delete-orphan')

class Step(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipe.id'), nullable=False)
    step_number = db.Column(db.Integer, nullable=False)
    image_path = db.Column(db.String(255))
    text = db.Column(db.Text)


@app.route('/recipes', methods=['GET'])
def get_recipes():
    recipes = Recipe.query.all()

    output = []
    for r in recipes:
        output.append({
            "id": r.id,
            "title": r.title,
            "description": r.description
        })

    return jsonify(output)

@app.route("/login", methods=['POST'])
@cross_origin()
def login():
    print("===> /login 호출됨")
    print("request.json:", request.json)
    print("request.data:", request.data)
    print("request.headers:", dict(request.headers))
    username = request.json.get('username')
    password = request.json.get('password')

    if username != 'test' or password != 'test':
        return jsonify({'msg': 'Bad credentials'}), 401
    
    access_token = create_access_token(identity=username)
    return jsonify(access_token=access_token)



@app.route('/recipes/<int:id>', methods=["PUT"])
@cross_origin()
@jwt_required()
def update_recipe(id):
    recipe = Recipe.query.get(id)
    if not recipe:
        return jsonify({"msg": "Recipe not found"}), 404
    
    data = request.get_json()
    recipe.title = data.get("title", recipe.title)
    recipe.description = data.get("description", recipe.description)

    db.session.commit()

    return jsonify({
        "msg": f"Updated recipe {id}",
        "id": recipe.id,
        "title": recipe.title,
        "description": recipe.description
    })

@app.route('/recipes/<int:id>', methods=["DELETE"])
@cross_origin()
@jwt_required()
def delete_recipe(id):
    recipe = Recipe.query.get(id)

    if not recipe:
        return jsonify({"msg": "Recipe not found"}), 404
    
    db.session.delete(recipe)
    db.session.commit()

    return jsonify({"msg": f"Deleted recipe {id}"})

@app.route('/recipes/<int:id>/like', methods=["POST", "OPTIONS"])
@cross_origin()
def like_recipe(id):
    if request.method == "OPTIONS":
        return '', 200 #preflight ok
    
    verify_jwt_in_request()
    current_user = get_jwt_identity()
    

    recipe = Recipe.query.get(id)
    if not recipe:
        return jsonify({"msg":"Recipe not found"}), 404
    
    recipe.likes += 1
    db.session.commit()

    return jsonify({
        "msg": f"Liked recipe {id}",
        "likes": recipe.likes
    })

@app.route("/recipes/popular", methods=["GET"])
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

@app.route('/recipes/latest')
def get_latest_recipes():
    recipes = Recipe.query.order_by(Recipe.id.desc()).limit(6).all()
    result=[]
    for recipe in recipes:
        result.append({
            "id": recipe.id,
            "title": recipe.title,
            "description": recipe.description,
        })

    return jsonify(result)

@app.route("/recipes/<int:id>")
def get_recipe(id):
    recipe = Recipe.query.get_or_404(id)
    return jsonify({
        "id": recipe.id,
        "title": recipe.title,
        "description": recipe.description,
        "likes": recipe.likes

    })




if __name__ == "__main__":
    app.run(debug=True)