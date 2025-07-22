from flask import Flask, send_from_directory
from config import Config
from extensions import db, limiter
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os

ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173,https://your-frontend-url.onrender.com').split(',')

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Allow all origins for all routes and support credentials
    CORS(app,
         origins=ALLOWED_ORIGINS,
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
         allow_headers=['Content-Type', 'Authorization', 'X-Requested-With'],
         supports_credentials=True,
         max_age=3600)
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

    @app.route('/uploads/avatars/<path:filename>')
    def uploaded_avatar(filename):
        uploads_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads/avatars')
        return send_from_directory(uploads_dir, filename)

    return app

app = create_app()

from flask_migrate import upgrade
with app.app_context():
    upgrade()

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)

