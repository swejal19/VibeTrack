
from flask import Blueprint, request, jsonify, current_app
import os
import MySQLdb.cursors
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from flask_mail import Message
import secrets
from datetime import datetime, timedelta

auth_bp = Blueprint("auth", __name__)

# ----------------------- LOGIN -----------------------
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    mysql = current_app.config["MYSQL"]
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
    user = cursor.fetchone()
    cursor.close()

    if user and check_password_hash(user["password"], password):
        access_token = create_access_token(identity=str(user["id"]))

        return jsonify({
            "message": "Login successful",
            "token": access_token,
            "user": {"id": user["id"], "name": user["name"], "email": user["email"]}
        }), 200

    return jsonify({"error": "Invalid credentials"}), 401


# ----------------------- PROFILE FETCH -----------------------
@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    user_id = int(get_jwt_identity())

    mysql = current_app.config["MYSQL"]
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute(
        "SELECT id, name, email, profile_photo FROM users WHERE id=%s",
        (user_id,)
    )
    user = cursor.fetchone()
    cursor.close()

    if not user:
        return jsonify({"error": "User not found"}), 404

    if user["profile_photo"]:
        backend_url = os.getenv("BACKEND_URL")
        user["profile_photo"] = f"{backend_url}{user['profile_photo']}"

    return jsonify(user), 200


# ----------------------- PROFILE UPDATE -----------------------
@auth_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    user_id = int(get_jwt_identity())

    new_name = request.form.get("name")
    profile_photo = request.files.get("profile_photo")

    if not new_name:
        return jsonify({"error": "Name is required"}), 400

    mysql = current_app.config["MYSQL"]
    cursor = mysql.connection.cursor()

    photo_path = None

    if profile_photo:
        upload_dir = os.path.join(os.getcwd(), "uploads")
        os.makedirs(upload_dir, exist_ok=True)

        filename = f"{user_id}_profile_{profile_photo.filename}"
        filepath = os.path.join(upload_dir, filename)
        profile_photo.save(filepath)

        photo_path = f"/uploads/{filename}"

        cursor.execute(
            "UPDATE users SET name=%s, profile_photo=%s WHERE id=%s",
            (new_name, photo_path, user_id)
        )
    else:
        cursor.execute(
            "UPDATE users SET name=%s WHERE id=%s",
            (new_name, user_id)
        )

    mysql.connection.commit()
    cursor.close()

    return jsonify({"message": "Profile updated successfully", "profile_photo": photo_path}), 200


# ----------------------- CHANGE PASSWORD -----------------------
@auth_bp.route("/change-password", methods=["POST"])
@jwt_required()
def change_password():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    old_password = data.get("old_password")
    new_password = data.get("new_password")

    if not old_password or not new_password:
        return jsonify({"error": "All fields are required"}), 400

    mysql = current_app.config["MYSQL"]
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

    cursor.execute("SELECT password FROM users WHERE id=%s", (user_id,))
    user = cursor.fetchone()

    if not user:
        cursor.close()
        return jsonify({"error": "User not found"}), 404

    if not check_password_hash(user["password"], old_password):
        cursor.close()
        return jsonify({"error": "Old password is incorrect"}), 401
    
    if len(new_password) < 8:
        cursor.close()
        return jsonify({"error": "Password must be at least 8 characters"}), 400

    if not any(c.isupper() for c in new_password):
        cursor.close()
        return jsonify({"error": "Password must contain an uppercase letter"}), 400

    if not any(c.isdigit() for c in new_password):
        cursor.close()
        return jsonify({"error": "Password must contain a number"}), 400

    hashed = generate_password_hash(new_password)
    cursor.execute("UPDATE users SET password=%s WHERE id=%s", (hashed, user_id))
    mysql.connection.commit()
    cursor.close()

    return jsonify({"message": "Password updated successfully"}), 200


# ----------------------- SIGNUP -----------------------
@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    mysql = current_app.config["MYSQL"]
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

    cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
    exists = cursor.fetchone()
    if exists:
        cursor.close()
        return jsonify({"error": "User already exists"}), 409

    hashed = generate_password_hash(password)

    cursor.execute(
        "INSERT INTO users (name, email, password) VALUES (%s, %s, %s)",
        (name, email, hashed)
    )
    mysql.connection.commit()

    cursor.execute("SELECT id, name, email FROM users WHERE email=%s", (email,))
    new_user = cursor.fetchone()

    cursor.close()
    return jsonify({"user": new_user}), 201


# ----------------------- FORGOT PASSWORD -----------------------
@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json()
    email = data.get("email")

    if not email:
        return jsonify({"error": "Email is required"}), 400

    mysql = current_app.config["MYSQL"]
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

    cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
    user = cursor.fetchone()
    if not user:
        cursor.close()
        return jsonify({"error": "User not found"}), 404

    token = secrets.token_urlsafe(32)
    expiry = datetime.utcnow() + timedelta(hours=1)

    cursor.execute(
        "UPDATE users SET reset_token=%s, reset_expiry=%s WHERE email=%s",
        (token, expiry, email)
    )
    mysql.connection.commit()
    cursor.close()

    mail = current_app.config["MAIL_INSTANCE"]
    reset_link = f"{os.getenv('FRONTEND_URL')}/reset-password?token={token}&email={email}"

    msg = Message(
        subject="Password Reset Request",
        sender=("VibeTrack", os.getenv("MAIL_USERNAME")),
        recipients=[email],
        body=f"Hello {user['name']},\n\nClick the link below to reset your password:\n{reset_link}\n\nThis link expires in 1 hour."
    )
    mail.send(msg)

    return jsonify({"message": "Password reset link sent"}), 200


# ----------------------- RESET PASSWORD -----------------------
@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json()
    email = data.get("email")
    token = data.get("token")
    new_password = data.get("new_password")

    if not email or not token or not new_password:
        return jsonify({"error": "All fields are required"}), 400

    if len(new_password) < 8:
        return jsonify({"error": "Password must be at least 8 characters"}), 400

    if not any(c.isupper() for c in new_password):
        return jsonify({"error": "Password must contain an uppercase letter"}), 400

    if not any(c.isdigit() for c in new_password):
        return jsonify({"error": "Password must contain a number"}), 400
    
    mysql = current_app.config["MYSQL"]
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

    cursor.execute(
        "SELECT * FROM users WHERE email=%s AND reset_token=%s",
        (email, token)
    )
    user = cursor.fetchone()

    if not user:
        cursor.close()
        return jsonify({"error": "Invalid token or email"}), 400

    if user["reset_expiry"] < datetime.utcnow():
        cursor.close()
        return jsonify({"error": "Reset token has expired"}), 400

    hashed = generate_password_hash(new_password)

    cursor.execute(
        "UPDATE users SET password=%s, reset_token=NULL, reset_expiry=NULL WHERE email=%s",
        (hashed, email)
    )
    mysql.connection.commit()
    cursor.close()

    return jsonify({"message": "Password reset successfully"}), 200



@auth_bp.route("/refresh-token", methods=["POST"])
@jwt_required()
def refresh_token():
    user_id = get_jwt_identity()
    new_token = create_access_token(identity=user_id)
    return jsonify({"token": new_token})
