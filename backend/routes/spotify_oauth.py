
import os
import base64
import time
import requests
from urllib.parse import urlencode
from flask import Blueprint, redirect, request, jsonify, session, current_app, make_response
from flask_jwt_extended import decode_token, get_jwt_identity, jwt_required

spotify_oauth_bp = Blueprint("spotify_oauth_bp", __name__)

CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
REDIRECT_URI = os.getenv("SPOTIFY_REDIRECT_URI")

SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize"
SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"


def save_tokens(user_id, access_token, refresh_token, expires_in):
    mysql = current_app.config["MYSQL"]
    expires_at = int(time.time()) + expires_in 

    cursor = mysql.connection.cursor()
    cursor.execute("""
        UPDATE users
        SET spotify_access_token=%s, spotify_refresh_token=%s, spotify_expires_at=%s
        WHERE id=%s
    """, (access_token, refresh_token, expires_at, user_id))

    mysql.connection.commit()


def refresh_user_token(refresh_token):
    auth_header = base64.b64encode(f"{CLIENT_ID}:{CLIENT_SECRET}".encode()).decode()

    resp = requests.post(
        SPOTIFY_TOKEN_URL,
        data={"grant_type": "refresh_token", "refresh_token": refresh_token},
        headers={"Authorization": f"Basic {auth_header}"}
    )

    data = resp.json()
    return data.get("access_token"), data.get("expires_in")


@spotify_oauth_bp.route("/login/spotify")
def login_spotify():
    token = request.args.get("token")
    incoming_state = request.args.get("state")

    if not token:
        return jsonify({"error": "Token missing"}), 400

    if not incoming_state:
        return jsonify({"error": "State missing from frontend"}), 400

    try:
        decoded = decode_token(token)
        user_id = int(decoded["sub"])
    except Exception as e:
        return jsonify({"error": "Invalid token", "details": str(e)}), 400

    session.clear()
    session.permanent = True
    session["spotify_state"] = incoming_state
    session["spotify_user_id"] = user_id
    session.modified = True

    print(f" Session SET: state={incoming_state}, user_id={user_id}")
    print(f" Session after set: {dict(session)}")
    print(f" Request cookies: {request.cookies}")

    scopes = "user-read-private user-read-email user-top-read playlist-read-private"

    params = {
        "response_type": "code",
        "client_id": CLIENT_ID,
        "scope": scopes,
        "redirect_uri": REDIRECT_URI,
        "state": incoming_state,
        "show_dialog": "true"
    }

    url = f"{SPOTIFY_AUTH_URL}?{urlencode(params)}"
    
    response = make_response(redirect(url))
    return response


@spotify_oauth_bp.route("/callback/spotify")
def spotify_callback():
    code = request.args.get("code")
    state = request.args.get("state")

    print(f" Callback received: state={state}")
    print(f" Request cookies on callback: {request.cookies}")
    print(f" Session contents: {dict(session)}")
    print(f" Session keys: {list(session.keys())}")

    original_state = session.get("spotify_state")

    if not original_state:
        return jsonify({
            "error": "Session lost — enable cookies",
            "debug": {
                "session_keys": list(session.keys()),
                "received_state": state,
                "cookies_received": list(request.cookies.keys()),
                "session_id": request.cookies.get('vibetrack_session', 'NONE')
            }
        }), 400

    if state != original_state:
        return jsonify({"error": "Invalid state", "expected": original_state, "received": state}), 400

    user_id = session.get("spotify_user_id")
    if not user_id:
        return jsonify({"error": "Missing user session"}), 400

    auth_header = base64.b64encode(f"{CLIENT_ID}:{CLIENT_SECRET}".encode()).decode()

    token_resp = requests.post(
        SPOTIFY_TOKEN_URL,
        data={
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": REDIRECT_URI,
        },
        headers={"Authorization": f"Basic {auth_header}"},
    )

    data = token_resp.json()
    access_token = data.get("access_token")
    refresh_token = data.get("refresh_token")
    expires_in = data.get("expires_in")

    if not access_token:
        return jsonify({"error": "Failed to authenticate with Spotify", "details": data}), 400

    save_tokens(user_id, access_token, refresh_token, expires_in)

    session.pop("spotify_state", None)
    session.pop("spotify_user_id", None)

    print(" Spotify OAuth complete, redirecting to frontend")

    frontend_url = os.getenv("FRONTEND_URL")
    return redirect(f"{frontend_url}/profile?spotify=connected")


@spotify_oauth_bp.route("/check-spotify", methods=["GET"])
@jwt_required()
def check_spotify():
    user_id = int(get_jwt_identity())
    mysql = current_app.config["MYSQL"]

    cursor = mysql.connection.cursor()
    cursor.execute("""
        SELECT spotify_access_token FROM users WHERE id=%s
    """, (user_id,))
    row = cursor.fetchone()

    return jsonify({"connected": bool(row and row[0])})


@spotify_oauth_bp.route("/spotify/me", methods=["GET"])
@jwt_required()
def spotify_me():
    user_id = int(get_jwt_identity())
    mysql = current_app.config["MYSQL"]

    cursor = mysql.connection.cursor()
    cursor.execute("""
        SELECT spotify_access_token, spotify_refresh_token, spotify_expires_at
        FROM users WHERE id=%s
    """, (user_id,))
    row = cursor.fetchone()

    if not row or not row[0]:
        return jsonify({"connected": False}), 200

    access_token, refresh_token, expires_at = row

    if time.time() > float(expires_at):
        new_access, expires_in = refresh_user_token(refresh_token)
        if not new_access:
            return jsonify({"error": "Failed to refresh Spotify token"}), 400

        save_tokens(user_id, new_access, refresh_token, expires_in)
        access_token = new_access

    headers = {"Authorization": f"Bearer {access_token}"}
    user_resp = requests.get("https://api.spotify.com/v1/me", headers=headers)

    if user_resp.status_code != 200:
        return jsonify({"error": "Failed to fetch Spotify profile"}), 400

    profile = user_resp.json()

    result = {
        "connected": True,
        "id": profile.get("id"),
        "email": profile.get("email"),
        "display_name": profile.get("display_name"),
        "country": profile.get("country"),
        "product": profile.get("product"),
        "image": profile["images"][0]["url"] if profile.get("images") else None
    }

    return jsonify(result), 200

@spotify_oauth_bp.route("/spotify/disconnect", methods=["POST"])
@jwt_required()
def disconnect_spotify():
    user_id = int(get_jwt_identity())
    mysql = current_app.config["MYSQL"]

    cursor = mysql.connection.cursor()
    cursor.execute("""
        UPDATE users
        SET spotify_access_token = NULL,
            spotify_refresh_token = NULL,
            spotify_expires_at = NULL
        WHERE id = %s
    """, (user_id,))
    mysql.connection.commit()
    cursor.close()

    return jsonify({"message": "Spotify disconnected successfully"}), 200
