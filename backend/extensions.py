# extensions.py
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager

jwt = JWTManager()

@jwt.user_identity_loader
def user_identity_lookup(identity):
    return str(identity)

db = SQLAlchemy()
bcrypt = Bcrypt()
