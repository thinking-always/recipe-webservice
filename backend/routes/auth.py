# routes/auth.py
from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from flask_jwt_extended import create_access_token
from models import User, db
from extensions import bcrypt  

routes_auth = Blueprint('routes_auth', __name__)

@routes_auth.route("/register", methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'msg': 'Username and password are required'}), 400
    
    if User.query.filter_by(username=username).first():
        return jsonify({'msg': 'Username already exists'}), 400
    
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, password_hash=hashed_password)

    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'success': True, 'msg': 'User registered successfully'}), 201

@routes_auth.route("/login", methods=['POST'])
@cross_origin()
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if user and user.check_password(password):
        access_token = create_access_token(identity=user.id)  
        return jsonify(access_token=access_token), 200
    else:
        return jsonify({"msg": "failed login"}), 401
