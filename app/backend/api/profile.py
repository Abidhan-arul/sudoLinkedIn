from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from flask_jwt_extended.exceptions import NoAuthorizationError, InvalidHeaderError
from models.user import User
from models.profile import Profile, Skill
from extensions import db
import os
import time
from werkzeug.utils import secure_filename

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'tiff', 'svg'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../uploads/avatars')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

profile_bp = Blueprint('profile', __name__)
 
@profile_bp.before_request
def log_jwt_errors():
    try:
        if request.method != 'OPTIONS':
            verify_jwt_in_request()
    except Exception as e:
        print(f"[JWT ERROR] {str(e)}")

@profile_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'msg': 'User not found'}), 404
    profile = Profile.query.filter_by(user_id=user_id).first()
    return jsonify({
        'id': user.id,
        'username': getattr(user, 'username', None) or getattr(user, 'name', None),
        'email': user.email,
        'profile': {
            'full_name': profile.full_name if profile else '',
            'headline': profile.headline if profile else '',
            'summary': profile.summary if profile else '',
            'location': profile.location if profile else '',
            'avatarUrl': profile.avatar_url if profile else '',
            'social': profile.social if profile else {},
            'skills': [s.name for s in profile.skills] if profile else [],
            # Add experiences, educations as needed
        }
    })

@profile_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    data = request.get_json()
    profile = Profile.query.filter_by(user_id=user_id).first()
    if not profile:
        profile = Profile(user_id=user_id, full_name=data.get('full_name', ''))
        db.session.add(profile)
    # Partial update logic with validation
    if 'full_name' in data:
        if not data['full_name'] or len(data['full_name']) > 120:
            return jsonify({'msg': 'Invalid full name'}), 400
        profile.full_name = data['full_name']
    if 'headline' in data:
        profile.headline = data['headline']
    if 'summary' in data:
        profile.summary = data['summary']
    if 'location' in data:
        profile.location = data['location']
    if 'avatarUrl' in data:
        profile.avatar_url = data['avatarUrl']
    if 'social' in data:
        profile.social = data['social']
    if 'skills' in data and isinstance(data['skills'], list):
        # Remove old skills
        profile.skills.clear()
        db.session.flush()
        # Add new skills
        for skill_name in data['skills']:
            if skill_name:
                profile.skills.append(Skill(name=skill_name))
    db.session.commit()
    return jsonify({'msg': 'Profile updated'})

@profile_bp.route('/profile/image', methods=['POST'])
@jwt_required()
def upload_profile_image():
    user_id = get_jwt_identity()
    if 'image' not in request.files:
        return jsonify({'msg': 'No file part'}), 400
    file = request.files['image']
    if file.filename == '':
        return jsonify({'msg': 'No selected file'}), 400
    if not allowed_file(file.filename):
        return jsonify({'msg': 'Invalid file type'}), 400
    file.seek(0, os.SEEK_END)
    file_length = file.tell()
    file.seek(0)
    if file_length > MAX_FILE_SIZE:
        return jsonify({'msg': 'File too large'}), 400
    ext = file.filename.rsplit('.', 1)[1].lower()
    filename = secure_filename(f"avatar_{user_id}_{int(time.time())}.{ext}")
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)
    # Update profile
    profile = Profile.query.filter_by(user_id=user_id).first()
    if not profile:
        return jsonify({'msg': 'Profile not found'}), 404
    profile.avatar_url = f"/uploads/avatars/{filename}"
    db.session.commit()
    return jsonify({'msg': 'Image uploaded', 'avatarUrl': profile.avatar_url}) 