from flask import Blueprint, request, jsonify, current_app, send_from_directory, abort
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from werkzeug.exceptions import RequestEntityTooLarge
from models.user import User
from models.profile import Profile
from utils.image_processor import save_uploaded_image, validate_image_file
from utils.security import validate_upload_request, sanitize_filename
from extensions import db
import os
import re

upload_bp = Blueprint('upload', __name__, url_prefix='/api')

@upload_bp.route('/images/<subfolder>/<filename>')
def serve_image(subfolder, filename):
    """Serve uploaded images with enhanced security"""
    # Validate subfolder to prevent directory traversal
    if not re.match(r'^[a-zA-Z0-9_-]+$', subfolder):
        abort(404)
    
    # Validate filename to prevent path traversal
    if not re.match(r'^[a-zA-Z0-9_.-]+$', filename):
        abort(404)
    
    # Check if filename starts with secure prefix
    secure_prefix = current_app.config.get('SECURE_FILENAME_PREFIX', 'img_')
    if not filename.startswith(secure_prefix) and not filename.startswith(f'thumb_{secure_prefix}'):
        abort(404)
    
    upload_folder = current_app.config['UPLOAD_FOLDER']
    file_path = os.path.join(upload_folder, subfolder, filename)
    
    # Security check: ensure file exists and is within upload directory
    if not os.path.exists(file_path) or not os.path.isfile(file_path):
        abort(404)
    
    # Additional security: ensure path is within upload directory (prevent directory traversal)
    real_path = os.path.realpath(file_path)
    upload_real_path = os.path.realpath(upload_folder)
    if not real_path.startswith(upload_real_path):
        abort(403)
    
    # Check file permissions
    try:
        if not os.access(file_path, os.R_OK):
            abort(403)
    except OSError:
        abort(404)
    
    # For profile images, allow public access (no authentication required)
    if subfolder == 'profile':
        # Set secure headers
        response = send_from_directory(os.path.join(upload_folder, subfolder), filename)
        response.headers['Cache-Control'] = 'public, max-age=3600'  # Cache for 1 hour
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        
        return response
    
    # For other subfolders, require authentication
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user:
            abort(401)
    except Exception:
        abort(401)
    
    # Set secure headers
    response = send_from_directory(os.path.join(upload_folder, subfolder), filename)
    response.headers['Cache-Control'] = 'public, max-age=3600'  # Cache for 1 hour
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    
    return response

@upload_bp.route('/upload/profile-image', methods=['POST'])
@jwt_required()
def upload_profile_image():
    """Upload profile image for authenticated user with enhanced security"""
    try:
        # Validate upload request
        is_valid, message = validate_upload_request()
        if not is_valid:
            return jsonify({'msg': message}), 400
        
        # Check if file is present
        if 'image' not in request.files:
            return jsonify({'msg': 'No image file provided'}), 400
        
        file = request.files['image']
        
        # Sanitize filename
        if file.filename:
            sanitized_filename = sanitize_filename(file.filename)
            if not sanitized_filename:
                return jsonify({'msg': 'Invalid filename'}), 400
        
        # Validate file
        is_valid, message = validate_image_file(file)
        if not is_valid:
            return jsonify({'msg': message}), 400
        
        # Get current user
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user:
            return jsonify({'msg': 'User not found'}), 404
        
        # Save image with processing
        result, message = save_uploaded_image(file, subfolder='profile')
        if not result:
            return jsonify({'msg': message}), 400
        
        # Update user's profile with image path
        profile = user.profile
        if not profile:
            profile = Profile(user_id=user.id)
            db.session.add(profile)
        
        # Store relative paths in database
        profile.profile_image = result['original']
        profile.profile_thumbnail = result['thumbnail']
        
        db.session.commit()
        
        return jsonify({
            'msg': 'Profile image uploaded successfully',
            'image': {
                'original': result['original'],
                'thumbnail': result['thumbnail']
            }
        }), 200
        
    except RequestEntityTooLarge:
        return jsonify({'msg': 'File too large'}), 413
    except Exception as e:
        return jsonify({'msg': 'Upload failed', 'error': str(e)}), 500

@upload_bp.route('/upload/post-image', methods=['POST'])
@jwt_required()
def upload_post_image():
    """Upload image for post content with enhanced security"""
    try:
        # Validate upload request
        is_valid, message = validate_upload_request()
        if not is_valid:
            return jsonify({'msg': message}), 400
        
        # Check if file is present
        if 'image' not in request.files:
            return jsonify({'msg': 'No image file provided'}), 400
        
        file = request.files['image']
        
        # Sanitize filename
        if file.filename:
            sanitized_filename = sanitize_filename(file.filename)
            if not sanitized_filename:
                return jsonify({'msg': 'Invalid filename'}), 400
        
        # Validate file
        is_valid, message = validate_image_file(file)
        if not is_valid:
            return jsonify({'msg': message}), 400
        
        # Save image with processing
        result, message = save_uploaded_image(file, subfolder='posts')
        if not result:
            return jsonify({'msg': message}), 400
        
        return jsonify({
            'msg': 'Image uploaded successfully',
            'image': {
                'original': result['original'],
                'thumbnail': result['thumbnail']
            }
        }), 200
        
    except RequestEntityTooLarge:
        return jsonify({'msg': 'File too large'}), 413
    except Exception as e:
        return jsonify({'msg': 'Upload failed', 'error': str(e)}), 500

@upload_bp.errorhandler(413)
def too_large(e):
    return jsonify({'msg': 'File too large'}), 413 