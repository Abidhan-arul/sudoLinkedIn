from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from models.user import User
from extensions import db, limiter
import re

auth_bp = Blueprint('auth', __name__, url_prefix="/api/auth")

sanitize = lambda s: re.sub(r'[^\w@.\-]', '', s) if isinstance(s, str) else s

@auth_bp.route('/signup', methods=['POST', 'OPTIONS'])
@limiter.limit("5 per minute")
def signup():
    if request.method == 'OPTIONS':
        return '', 204
    data = request.get_json()
    username = sanitize(data.get('username', '').strip())
    email = sanitize(data.get('email', '').strip())
    password = data.get('password', '')

    if not username or not email or not password:
        return jsonify({'msg': 'Missing required fields'}), 400

    if not User.is_username_unique(username):
        return jsonify({'msg': 'Username already exists'}), 400
    if not User.is_email_unique(email):
        return jsonify({'msg': 'Email already exists'}), 400
    if not User.is_password_complex(password):
        return jsonify({'msg': 'Password does not meet complexity requirements'}), 400

    try:
        user = User(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        return jsonify({'msg': 'User created'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'msg': 'Registration failed', 'error': str(e)}), 400

@auth_bp.route('/login', methods=['POST', 'OPTIONS'])
@limiter.limit("1000 per minute")
def login():
    if request.method == 'OPTIONS':
        return '', 204
    data = request.get_json()
    identifier = sanitize(data.get('username', '').strip()) or sanitize(data.get('email', '').strip())
    password = data.get('password', '')

    user = User.query.filter((User.username == identifier) | (User.email == identifier)).first()
    if not user or not user.check_password(password):
        return jsonify({'msg': 'Invalid credentials'}), 401

    access_token = create_access_token(identity=str(user.id))
    return jsonify({'token': access_token, 'user': {'id': user.id, 'username': user.username, 'email': user.email}}), 200

