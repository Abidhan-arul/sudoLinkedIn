from flask import Flask
from config import Config
from extensions import db, limiter
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Update CORS to allow frontend origin and credentials
    CORS(app, supports_credentials=True, origins=["http://localhost:5173"])
    db.init_app(app)
    limiter.init_app(app)
    Migrate(app, db)
    JWTManager(app)

    from api.auth import auth_bp
    app.register_blueprint(auth_bp)

    from api.profile import profile_bp
    app.register_blueprint(profile_bp)

    # Ensure all tables are created
    with app.app_context():
        db.create_all()

    return app
if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)


