
import os
import cv2
import base64
import numpy as np
from tensorflow.keras.models import load_model
from flask import Blueprint, request, jsonify
import tensorflow as tf
from huggingface_hub import hf_hub_download

tf.config.set_visible_devices([], 'GPU') 
tf.config.threading.set_intra_op_parallelism_threads(1)
tf.config.threading.set_inter_op_parallelism_threads(1)

# Paths & Model Load
MODEL_PATH = os.path.join(os.path.dirname(__file__), "best_emotion_model.h5")

model = None

MODEL_REPO = "Swejal/vibetrack-emotion-model"
MODEL_FILENAME = "best_emotion_model.h5"

def get_model():
    global model
    if model is None:
        # 1. Check if model exists locally
        if os.path.exists(MODEL_PATH):
            print(f"🔹 Loading local emotion model from: {MODEL_PATH}")
            model_path = MODEL_PATH

        # 2. Otherwise download from Hugging Face
        else:
            print("⚠️ Local model not found.")
            print("🔹 Downloading emotion model from Hugging Face...")

            model_path = hf_hub_download(
                repo_id=MODEL_REPO,
                filename=MODEL_FILENAME,
                repo_type="model"
            )

            print(f"✅ Model downloaded to: {model_path}")

        # 3. Load the model
        model = load_model(model_path)

        print("✅ Emotion model loaded successfully!")
    return model

#emotion labels
emotion_labels = ["angry", "disgust", "fear", "happy", "neutral", "sad", "surprise"]

# initialize Flask Blueprint
emotion_bp = Blueprint("emotion_bp", __name__)

# loading OpenCV face detector
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')


def preprocess_image(image_bytes):
    
    img_array = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Invalid image data")

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)

    if len(faces) > 0:
        # first detected face
        x, y, w, h = faces[0]
        gray = gray[y:y+h, x:x+w]

    # 48x48
    gray = cv2.resize(gray, (48, 48))
    gray = gray / 255.0
    gray = np.expand_dims(gray, axis=(0, -1))  
    return gray


def predict_emotion(image_bytes):
    img = preprocess_image(image_bytes)
    mdl = get_model()
    predictions = mdl.predict(img,verbose=0)
    predicted_label = emotion_labels[np.argmax(predictions)]
    return predicted_label


@emotion_bp.route("/detect-emotion", methods=["POST"])
def detect_emotion():
    
    try:
        data = request.get_json()
        if not data or "image" not in data:
            return jsonify({"error": "No image provided"}), 400

        image_base64 = data["image"]

        if "," in image_base64:
            image_base64 = image_base64.split(",")[1]

        missing_padding = len(image_base64) % 4
        if missing_padding:
            image_base64 += "=" * (4 - missing_padding)

        image_bytes = base64.b64decode(image_base64)

        emotion = predict_emotion(image_bytes)
        return jsonify({"emotion": emotion}), 200

    except Exception as e:
        print("❌ Emotion detection error:", str(e))
        return jsonify({"error": str(e)}), 500


