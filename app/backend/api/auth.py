from flask import Blueprint, request, jsonify
from models.user import User
from extensions import db
from flask_jwt_extended import create_access_token
from datetime import timedelta

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not all([username, email, password]):
        return jsonify({"error": "All fields are required."}), 400

    if not User.is_username_unique(username):
        return jsonify({"error": "Username already exists."}), 409

    if not User.is_email_unique(email):
        return jsonify({"error": "Email already exists."}), 409

    try:
        user = User(username=username, email=email)
        user.set_password(password)
        user.save()
        return jsonify({"message": "Signup successful!"}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception:
        return jsonify({"error": "Internal server error."}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({"error": "Email and password are required."}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password."}), 401

    access_token = create_access_token(identity=str(user.id), expires_delta=timedelta(days=1))
    return jsonify({
        "message": "Login successful!",
        "access_token": access_token,
        "username": user.username
    }), 200

