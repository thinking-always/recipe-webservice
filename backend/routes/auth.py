# backend/routes/auth.py

from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from flask_jwt_extended import create_access_token

routes_auth = Blueprint('routes_auth', __name__)

@routes_auth.route("/login", methods=['POST'])
@cross_origin()
def login():
    username = request.json.get('username')
    password = request.json.get('password')
    if username != 'test' or password != 'test':
        return jsonify({'msg': 'Bad credentials'}), 401
    access_token = create_access_token(identity=username)
    return jsonify(access_token=access_token)
