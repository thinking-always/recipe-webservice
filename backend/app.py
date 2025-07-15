import os
from dotenv import load_dotenv
from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token
from datetime import timedelta

from extensions import bcrypt, db, jwt, migrate
from models import db
from routes import routes_recipes, routes_ingredients, routes_auth, calendar_bp, routes_cloudinary, comments_bp

# 1. 환경별 .env 로드
env = os.getenv("FLASK_ENV", "development")
if env == "production":
    load_dotenv(".env.production")
else:
    load_dotenv(".env.development")

# 2. Flask 앱 생성
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "https://recipe-webservice.vercel.app"]}})


# 3. 환경 설정 적용
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER', 'uploads')
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=15)
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=7)

# 4. 확장 초기화
bcrypt.init_app(app)
jwt.init_app(app)
db.init_app(app)
migrate.init_app(app, db)

# 5. DB 테이블 생성
with app.app_context():
    db.create_all()

# 6. 블루프린트 등록
app.register_blueprint(routes_recipes)
app.register_blueprint(routes_ingredients)
app.register_blueprint(routes_auth, url_prefix="/auth")
app.register_blueprint(routes_cloudinary)
app.register_blueprint(calendar_bp)
app.register_blueprint(comments_bp)

# 7. 에러 핸들러 및 업로드 라우트
@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Not Found"}), 404

@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# 8. 실행
if __name__ == "__main__":
    app.run(debug=(env == "development"))
