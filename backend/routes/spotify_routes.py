
import os
import requests
from flask import Blueprint, request, jsonify
from dotenv import load_dotenv
from ml.spotify import sp  
from flask import current_app
from flask_jwt_extended import get_jwt_identity, jwt_required

load_dotenv()

spotify_bp = Blueprint("spotify_bp", __name__)

EMOTION_TO_GENRE = {
    "happy": "pop upbeat",
    "sad": "acoustic chill",
    "angry": "rock metal",
    "fear": "ambient",
    "surprise": "dance electronic",
    "disgust": "indie lo-fi",
    "neutral": "soft instrumental",
}

SUPPORTED_LANGUAGES = ["english", "hindi", "punjabi", "spanish", "tamil", "korean"]

@spotify_bp.route("/recommendations", methods=["GET"])
@jwt_required()
def get_recommendations():
    try:
        user_id = int(get_jwt_identity())
        mysql = current_app.config["MYSQL"]

        cursor = mysql.connection.cursor()
        cursor.execute("""
            SELECT spotify_access_token, spotify_refresh_token, spotify_expires_at
            FROM users WHERE id = %s
        """, (user_id,))
        row = cursor.fetchone()
        cursor.close()

        if not row or not row[0]:
            return jsonify({"error": "Spotify not connected for this user"}), 400

        access_token, refresh_token, expires_at = row
        import time

        if time.time() > float(expires_at):
            from routes.spotify_oauth import refresh_user_token, save_tokens
            new_access_token, expires_in = refresh_user_token(refresh_token)
            save_tokens(user_id, new_access_token, refresh_token, expires_in)
            access_token = new_access_token

        headers = {"Authorization": f"Bearer {access_token}"}

        emotion = request.args.get("emotion", "neutral").lower()
        language = request.args.get("language", "").lower()

        genre = EMOTION_TO_GENRE.get(emotion, "pop")

        language_query_map = {
            "english": "",
            "hindi": "hindi bollywood",
            "punjabi": "punjabi gurbani sidhu moose wala ap dhillon karan aujla",
            "spanish": "reggaeton latin",
            "korean": "kpop",
            "french": "french chanson",
        }

        lang_keywords = language_query_map.get(language, "")
        query = f"{genre} {lang_keywords}".strip()

        response = requests.get(
            f"https://api.spotify.com/v1/search?q={query}&type=track&limit=18",
            headers=headers,
        )

        if response.status_code != 200:
            print("Spotify API error:", response.text)
            return jsonify({"error": "Spotify request failed"}), 500

        data = response.json().get("tracks", {}).get("items", [])
        tracks = []

        for item in data:
            tracks.append({
                "id": item.get("id"),
                "name": item.get("name"),
                "artist": item["artists"][0]["name"] if item.get("artists") else "Unknown Artist",
                "image": item["album"]["images"][0]["url"] if item["album"].get("images") else "",
                "preview": item.get("preview_url"),
                "url": item["external_urls"]["spotify"],
            })

        return jsonify({
            "emotion": emotion,
            "language": language or "all",
            "tracks": tracks
        })

    except Exception as e:
        print("Error fetching Spotify recommendations:", e)
        return jsonify({"error": "Failed to fetch recommendations", "details": str(e)}), 500

@spotify_bp.route('/like-song', methods=['POST'])
@jwt_required()
def like_song():
    mysql = current_app.config['MYSQL']
    data = request.get_json()

    user_id = int(get_jwt_identity())
    song_id = data.get("song_id")
    song_name = data.get("song_name")

    if not song_id:
        return jsonify({"error": "Missing song_id"}), 400

    try:
        cursor = mysql.connection.cursor()
        cursor.execute(
            """
            INSERT IGNORE INTO liked_songs (user_id, song_id, song_name)
            VALUES (%s, %s, %s)
            """,
            (user_id, song_id, song_name)
        )
        mysql.connection.commit()
        if cursor.rowcount == 0:
            return jsonify({"message": "Song already liked"}), 200
        return jsonify({"message": "Song liked successfully"}), 201

    except Exception as e:
        print("DB Insert Error:", e)
        return jsonify({"error": "Failed to like song"}), 500



@spotify_bp.route('/liked-songs', methods=['GET'])
@jwt_required()
def get_liked_songs():
    mysql = current_app.config['MYSQL']

    user_id = int(get_jwt_identity())

    try:
        cursor = mysql.connection.cursor()
        cursor.execute(
            "SELECT song_id, song_name, liked_at FROM liked_songs WHERE user_id = %s ORDER BY liked_at DESC",
            (user_id,)
        )
        rows = cursor.fetchall()

        liked_songs = []
        for row in rows:
            liked_songs.append({
                "song_id": row[0],
                "song_name": row[1],
                "liked_at": row[2].strftime("%Y-%m-%d")
            })

        return jsonify({"liked_songs": liked_songs}), 200

    except Exception as e:
        print("DB Fetch Error:", e)
        return jsonify({"error": "Failed to fetch liked songs"}), 500



@spotify_bp.route("/liked-songs/<string:song_id>", methods=["DELETE"])
@jwt_required()
def remove_liked_song(song_id):
    mysql = current_app.config['MYSQL']

    user_id = int(get_jwt_identity())

    try:
        cursor = mysql.connection.cursor()
        cursor.execute(
            "DELETE FROM liked_songs WHERE user_id = %s AND song_id = %s",
            (user_id, song_id)
        )
        mysql.connection.commit()

        return jsonify({"message": "Song removed successfully"}), 200

    except Exception as e:
        print("DB Delete Error:", e)
        return jsonify({"error": "Failed to remove song"}), 500
