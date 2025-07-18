from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.exceptions import RequestEntityTooLarge
from models.user import User
from models.profile import Profile
from utils.image_processor import save_uploaded_image, validate_image_file
from extensions import db

profile_bp = Blueprint('profile', __name__, url_prefix='/api')
 
@profile_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'msg': 'User not found'}), 404

    profile = user.profile
    if not profile:
        # Auto-create a profile if it doesn't exist
        profile = Profile(user_id=user.id, full_name=user.username)
        db.session.add(profile)
        db.session.commit()

    # Build image URLs if profile images exist
    base_url = request.host_url.rstrip('/')
    profile_data = profile.to_dict()

    if profile.profile_image:
        profile_data['profile_image_url'] = f"{base_url}/api/images/profile/{profile.profile_image}"
    if profile.profile_thumbnail:
        profile_data['profile_thumbnail_url'] = f"{base_url}/api/images/profile/{profile.profile_thumbnail}"

    return jsonify({'profile': profile_data}), 200

@profile_bp.route('/profile/image', methods=['POST'])
@jwt_required()
def upload_profile_image():
    """Handle profile image uploads"""
    try:
        # Check if file is present in multipart form data
        if 'image' not in request.files:
            return jsonify({'msg': 'No image file provided'}), 400
        
        file = request.files['image']
        
        # Validate file type and size
        is_valid, message = validate_image_file(file)
        if not is_valid:
            return jsonify({'msg': message}), 400
        
        # Get current user
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user:
            return jsonify({'msg': 'User not found'}), 404
        
        # Process and store image
        result, message = save_uploaded_image(file, subfolder='profile')
        if not result:
            return jsonify({'msg': message}), 400
        
        # Update user profile with image paths
        profile = user.profile
        if not profile:
            profile = Profile(user_id=user.id)
            db.session.add(profile)
        
        profile.profile_image = result['original']
        profile.profile_thumbnail = result['thumbnail']
        
        db.session.commit()
        
        # Return image URLs
        base_url = request.host_url.rstrip('/')
        image_urls = {
            'original': f"{base_url}/api/images/profile/{result['original']}",
            'thumbnail': f"{base_url}/api/images/profile/{result['thumbnail']}"
        }
        
        return jsonify({
            'msg': 'Profile image uploaded successfully',
            'image_urls': image_urls,
            'filename': result['original']
        }), 200
        
    except RequestEntityTooLarge:
        return jsonify({'msg': 'File too large'}), 413
    except Exception as e:
        return jsonify({'msg': 'Upload failed', 'error': str(e)}), 500

@profile_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'msg': 'User not found'}), 404
    profile = user.profile
    if not profile:
        profile = Profile(user_id=user.id)
        db.session.add(profile)
    data = request.get_json() or {}
    # List of allowed fields
    allowed_fields = ['full_name', 'headline', 'summary', 'location', 'about', 'skills']
    errors = {}
    for field in allowed_fields:
        if field in data:
            value = data[field]
            # Simple validation
            if field == 'full_name' and (not value or len(value) < 2):
                errors[field] = 'Full name must be at least 2 characters.'
            elif field == 'headline' and value and len(value) > 255:
                errors[field] = 'Headline too long.'
            elif field == 'location' and value and len(value) > 120:
                errors[field] = 'Location too long.'
            elif field == 'skills':
                # Accept array or comma-separated string
                if isinstance(value, list):
                    value = ','.join([str(s).strip() for s in value if s])
                elif isinstance(value, str):
                    value = ','.join([s.strip() for s in value.split(',') if s.strip()])
                setattr(profile, field, value)
            else:
                setattr(profile, field, value)
    # Handle email update (on User model)
    if 'email' in data:
        new_email = data['email'].strip()
        if not new_email:
            errors['email'] = 'Email cannot be empty.'
        elif new_email != user.email:
            # Check uniqueness
            if User.query.filter_by(email=new_email).first():
                errors['email'] = 'Email already exists.'
            else:
                user.email = new_email
    if errors:
        return jsonify({'msg': 'Invalid data', 'errors': errors}), 400
    db.session.commit()
    # Build response
    profile_data = profile.to_dict()
    profile_data['email'] = user.email  # Always return the latest email from User model
    return jsonify({'profile': profile_data}), 200 