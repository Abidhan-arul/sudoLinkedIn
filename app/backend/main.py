from flask import Flask
from config import Config
from extensions import db, limiter
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Allow only frontend origin and support credentials
    CORS(app, origins=["http://localhost:5173"], supports_credentials=True)
    db.init_app(app)
    limiter.init_app(app)
    Migrate(app, db)
    JWTManager(app)

    from api.auth import auth_bp
    app.register_blueprint(auth_bp)

    from api.profile import profile_bp
    app.register_blueprint(profile_bp)

    from api.upload import upload_bp
    app.register_blueprint(upload_bp)

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)

