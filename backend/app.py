from flask import Flask
from flask_cors import CORS, cross_origin
from flask import request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity,verify_jwt_in_request
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

CORS(app, supports_credentials=True)

app.config['JWT_SECRET_KEY'] = 'super-secret'
jwt = JWTManager(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///recipes.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

@app.route("/")
def home():
    return "Hello, backend!"

@app.route("/recipes", methods=["POST"])
@cross_origin()
@jwt_required()
def add_recipe():
    print("JWT:", get_jwt_identity())

    data = request.get_json()

    title = data.get("title")
    description = data.get("description")

    new_recipe = Recipe(title=title, description=description)
    
    db.session.add(new_recipe)

    db.session.commit()

    return jsonify({
        "success": True,
        "id": new_recipe.id,
        "title": new_recipe.title,
        "description": new_recipe.description
    }), 201

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

class Recipe(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=True)
    likes = db.Column(db.Integer, default=0)

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