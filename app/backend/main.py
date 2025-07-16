from flask import Flask
from config import Config
from extensions import db, limiter
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)
    db.init_app(app)
    limiter.init_app(app)
    Migrate(app, db)
    JWTManager(app)

    from api.auth import auth_bp
    app.register_blueprint(auth_bp)

    return app

