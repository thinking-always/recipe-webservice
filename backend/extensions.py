# extensions.py
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate




jwt = JWTManager()
db = SQLAlchemy()
bcrypt = Bcrypt()
migrate = Migrate()

@jwt.user_identity_loader
def user_identity_lookup(identity):
    return str(identity)