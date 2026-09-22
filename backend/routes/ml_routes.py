
from flask import Blueprint, current_app, request, jsonify
from ml.emotion_model import predict_emotion
from flask_jwt_extended import jwt_required, get_jwt_identity
import MySQLdb.cursors
import base64

ml_bp = Blueprint("ml_bp", __name__)

@ml_bp.route("/detect-emotion", methods=["POST"])
@jwt_required()
def detect_emotion():
    try:
        data = request.get_json()

        if not data or "image" not in data:
            return jsonify({"error": "No image provided"}), 400

        image_data = data["image"]

        if "," in image_data:
            image_data = image_data.split(",")[1]

        missing_padding = len(image_data) % 4
        if missing_padding:
            image_data += "=" * (4 - missing_padding)

        image_bytes = base64.b64decode(image_data)

        emotion = predict_emotion(image_bytes)
        
        if not emotion:
            return jsonify({"status": "no-face", "emotion": None}), 200

        mysql = current_app.config["MYSQL"]

        user_id = int(get_jwt_identity())

        cursor = mysql.connection.cursor()
        cursor.execute(
            "INSERT INTO mood_history (user_id, mood) VALUES (%s, %s)",
            (user_id, emotion)
        )
        mysql.connection.commit()
        cursor.close()

        return jsonify({"status": "success", "emotion": emotion}), 200

    except Exception as e:
        print("❌ Emotion detection error:", str(e))
        return jsonify({"error": "Emotion detection failed"}), 500
