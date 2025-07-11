from dotenv import load_dotenv
load_dotenv()

from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from models import db
from flask import Flask
import os
from extensions import bcrypt, SQLAlchemy, jwt
from flask_jwt_extended import JWTManager, create_access_token
from datetime import timedelta


from models import db
from routes import routes_recipes, routes_ingredients, routes_auth, calendar_bp, routes_cloudinary


app = Flask(__name__)
CORS(app)

app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER')
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=15)
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=7)


bcrypt.init_app(app) 
jwt.init_app(app)
db.init_app(app)


with app.app_context():
    db.create_all()

app.register_blueprint(routes_recipes)
app.register_blueprint(routes_ingredients)
app.register_blueprint(routes_auth)
app.register_blueprint(calendar_bp)
app.register_blueprint(routes_cloudinary)


@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Not Found"}), 404

@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory('uploads', filename)


if __name__ == "__main__":
    app.run(debug=True)
