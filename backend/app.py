
import os
from flask import send_from_directory, Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
from flask_mysqldb import MySQL
from flask_mail import Mail
from flask_session import Session
from datetime import timedelta

from routes.ml_routes import ml_bp
from routes.spotify_routes import spotify_bp
from routes.auth_routes import auth_bp
from routes.mood_routes import mood_bp
from routes.spotify_oauth import spotify_oauth_bp

load_dotenv()

def create_app():
    app = Flask(__name__)

    CORS(app,
        resources={r"/*": {"origins": ["https://vibetrackk.vercel.app","http://127.0.0.1:3000", "http://localhost:3000"]}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        expose_headers=["Content-Type"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
        )

    app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'dev-secret-change-in-production')
    app.config['SESSION_TYPE'] = 'filesystem'
    app.config['SESSION_FILE_DIR'] = './flask_session'
    
    app.config['SESSION_COOKIE_NAME'] = 'vibetrack_session'
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['SESSION_COOKIE_SECURE'] = False
    app.config['SESSION_COOKIE_DOMAIN'] = None  
    app.config['SESSION_COOKIE_PATH'] = '/'
    app.config['SESSION_PERMANENT'] = True
    app.config['PERMANENT_SESSION_LIFETIME'] = 3600

    Session(app)

    app.config['MYSQL_HOST'] = os.getenv('MYSQL_HOST', 'localhost')
    app.config['MYSQL_USER'] = os.getenv('MYSQL_USER', 'root')
    app.config['MYSQL_PASSWORD'] = os.getenv('MYSQL_PASSWORD', '')
    app.config['MYSQL_DB'] = os.getenv('MYSQL_DB', 'vibetrack_db')
    app.config['MYSQL_PORT'] = int(os.getenv('MYSQL_PORT', 3306))

    mysql = MySQL(app)
    app.config['MYSQL'] = mysql

    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev-jwt-secret-change-in-production')
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=7)
    JWTManager(app)

    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_USERNAME')

    mail = Mail()
    mail.init_app(app)

    app.config["MAIL_INSTANCE"] = mail

    @app.route("/")
    def home():
        return {"message": "Server running"}, 200

    app.register_blueprint(ml_bp, url_prefix="/api")
    app.register_blueprint(spotify_bp, url_prefix="/api")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(mood_bp, url_prefix="/api/mood")
    app.register_blueprint(spotify_oauth_bp, url_prefix="/api")


    @app.route('/uploads/<path:filename>')
    def serve_upload(filename):
        upload_dir = os.path.join(os.getcwd(), "uploads")
        return send_from_directory(upload_dir, filename)

    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)