from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Comment


comments_bp = Blueprint('comments', __name__)

@comments_bp.route("/comments", methods=['POST'])
@jwt_required()
def create_comment():
    user_id = get_jwt_identity()
    data = request.get_json()
    recipe_id = data.get("recipe_id")
    content = data.get("content")
    
    if not recipe_id or not content:
        return jsonify({"error": " recipe_id and content are required"}), 400
    
    comment = Comment(user_id=user_id, recipe_id=recipe_id, content=content)
    
    db.session.add(comment)
    db.session.commit()
    
    return jsonify(comment.serialize()), 201

@comments_bp.route("/comments/<int:recipe_id>", methods=["GET"])
def get_comments(recipe_id):
    comments = Comment.query.filter_by(recipe_id=recipe_id).order_by(Comment.created_at.desc()).all()
    return jsonify([c.serialize() for c in comments])