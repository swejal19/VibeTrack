

from flask import Blueprint, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
import MySQLdb.cursors
from datetime import datetime, timedelta

mood_bp = Blueprint("mood_bp", __name__)

# ------------------------ GET MOOD HISTORY ------------------------
@mood_bp.route("/history", methods=["GET"])
@jwt_required()
def get_mood_history():
    mysql = current_app.config["MYSQL"]

    user_id = int(get_jwt_identity())

    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute("""
        SELECT mood, detected_at
        FROM mood_history
        WHERE user_id = %s
        ORDER BY detected_at DESC
        LIMIT 20
    """, (user_id,))

    data = cursor.fetchall()
    cursor.close()

    return jsonify({"history": data}), 200


# ---------------------- WEEKLY ANALYTICS ----------------------
@mood_bp.route("/analytics", methods=["GET"])
@jwt_required()
def mood_analytics():
    mysql = current_app.config["MYSQL"]

    user_id = int(get_jwt_identity())

    one_week_ago = datetime.now() - timedelta(days=7)

    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute("""
        SELECT mood, detected_at
        FROM mood_history
        WHERE user_id = %s
        AND detected_at >= %s
        ORDER BY detected_at ASC
    """, (user_id, one_week_ago))

    rows = cursor.fetchall()
    cursor.close()

    if not rows:
        return jsonify({
            "timeline": [],
            "distribution": {}
        }), 200

    mood_count = {}
    timeline = []

    for row in rows:
        mood = row["mood"]
        date_str = row["detected_at"].strftime("%Y-%m-%d")

        timeline.append({"date": date_str, "mood": mood})
        mood_count[mood] = mood_count.get(mood, 0) + 1

    return jsonify({
        "timeline": timeline,
        "distribution": mood_count
    }), 200


# -------------------- MOOD STREAK + SUMMARY --------------------
@mood_bp.route("/summary", methods=["GET"])
@jwt_required()
def mood_summary():
    mysql = current_app.config["MYSQL"]

    user_id = int(get_jwt_identity())

    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute("""
        SELECT DATE(detected_at) AS d,
            SUBSTRING_INDEX(
                GROUP_CONCAT(mood ORDER BY detected_at DESC),
                ',', 1
            ) AS mood
        FROM mood_history
        WHERE user_id=%s
        GROUP BY DATE(detected_at)
        ORDER BY d DESC
    """, (user_id,))
    
    rows = cursor.fetchall()
    cursor.close()

    if not rows:
        return jsonify({
            "streak": 0,
            "dominant_mood": None,
            "summary": "No mood data found. Start tracking your emotions!"
        }), 200
        
    dates = [row["d"] for row in rows]
    moods = [row["mood"] for row in rows]
    today = datetime.utcnow().date()
    yesterday = today - timedelta(days=1)

    if dates[0] == today:
        start_day = today
    elif dates[0] == yesterday:
        start_day = yesterday
    else:
        # Missed full day
        return jsonify({
            "streak": 0,
            "dominant_mood": max(set(moods), key=moods.count),
            "summary": "You missed a day. Start a new streak today!"
        }), 200

    # Count backward consecutive days
    streak = 0
    expected = start_day

    for d in dates:
        if d == expected:
            streak += 1
            expected -= timedelta(days=1)
        else:
            break

    # --------- Dominant mood + summary ----------
    moods = [row["mood"] for row in rows]
    dominant = max(set(moods), key=moods.count)
    summary = f"You are mostly feeling {dominant} recently."

    return jsonify({
        "streak": streak,
        "dominant_mood": dominant,
        "summary": summary
    }), 200
