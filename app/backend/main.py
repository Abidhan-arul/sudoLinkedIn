from flask import Flask, send_from_directory
from config import Config
from extensions import db, limiter
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Allow all origins for all routes and support credentials
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
    db.init_app(app)
    limiter.init_app(app)
    Migrate(app, db)
    JWTManager(app)

    from api.auth import auth_bp
    from api.posts import posts_bp
    from api.feed import feed_bp
    from api.profile import profile_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(posts_bp)
    app.register_blueprint(feed_bp)
    app.register_blueprint(profile_bp)

    # Serve uploaded media files
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        uploads_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
        return send_from_directory(uploads_dir, filename)

    return app

