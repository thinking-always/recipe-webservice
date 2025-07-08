# ✅ Flask 서버: cloudinary_routes.py

from flask import Blueprint, jsonify
import cloudinary
import cloudinary.utils
import os
import time

routes_cloudinary = Blueprint('routes_cloudinary', __name__)

# Cloudinary config
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)

@routes_cloudinary.route('/uploader/signature')
def get_signature():
    timestamp = int(time.time())
    folder = "my_recipe_images"  # ✅ 프론트에서 쓰는 폴더와 동일하게!
    
    params_to_sign = {
        "timestamp": timestamp,
        "folder": folder
    }

    api_secret = os.getenv("CLOUDINARY_API_SECRET")
    signature = cloudinary.utils.api_sign_request(params_to_sign, api_secret)

    return jsonify({
        "signature": signature,
        "timestamp": timestamp,
        "api_key": os.getenv("CLOUDINARY_API_KEY"),
        "cloud_name": os.getenv("CLOUDINARY_CLOUD_NAME"),
        "folder": folder
    })

