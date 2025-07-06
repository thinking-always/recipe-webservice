from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from models import db
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os


from models import db
from routes import routes_recipes, routes_ingredients, routes_auth, calendar_bp

load_dotenv()

app = Flask(__name__)
CORS(app)

app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER')

db.init_app(app)
jwt = JWTManager(app)

with app.app_context():
    db.create_all()

app.register_blueprint(routes_recipes)
app.register_blueprint(routes_ingredients)
app.register_blueprint(routes_auth)
app.register_blueprint(calendar_bp)


@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Not Found"}), 404

if __name__ == "__main__":
    app.run(debug=True)
