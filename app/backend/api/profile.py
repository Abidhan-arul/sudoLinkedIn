from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.profile import Profile, Skill, Experience, Education
from extensions import db
import os
import uuid
from werkzeug.utils import secure_filename

profile_bp = Blueprint('profile', __name__, url_prefix='/api/profile')

# Configure upload settings
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def serialize_profile(profile):
    return {
        "full_name": profile.full_name,
        "headline": profile.headline,
        "summary": profile.summary,
        "location": profile.location,
        "image_url": profile.image_url,
        "skills": [s.name for s in profile.skills],
        "experiences": [
            {
                "id": e.id,
                "title": e.title,
                "company": e.company,
                "location": e.location,
                "start_date": e.start_date.isoformat() if e.start_date else None,
                "end_date": e.end_date.isoformat() if e.end_date else None,
                "description": e.description,
            } for e in profile.experiences
        ],
        "educations": [
            {
                "id": ed.id,
                "school": ed.school,
                "degree": ed.degree,
                "field_of_study": ed.field_of_study,
                "start_year": ed.start_year,
                "end_year": ed.end_year,
                "description": ed.description,
            } for ed in profile.educations
        ]
    }

@profile_bp.route('', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = int(get_jwt_identity())
    profile = Profile.query.filter_by(user_id=user_id).first()
    if not profile:
        return jsonify({"error": "Profile not found"}), 404
    return jsonify(serialize_profile(profile)), 200

@profile_bp.route('', methods=['PUT'])
@jwt_required()
def put_profile():
    user_id = int(get_jwt_identity())
    data = (getattr(request, 'json', None) or request.get_json() or {})
    profile = Profile.query.filter_by(user_id=user_id).first()
    if not profile:
        profile = Profile(user_id=user_id)
        db.session.add(profile)
    
    # Update basic profile fields
    for field in ['full_name', 'headline', 'summary', 'location']:
        if field in data:
            setattr(profile, field, data[field])
    
    # Update skills
    if 'skills' in data:
        # Clear existing skills
        Skill.query.filter_by(profile_id=profile.id).delete()
        # Add new skills
        for skill_name in data['skills']:
            if skill_name.strip():
                skill = Skill(name=skill_name.strip(), profile=profile)
                db.session.add(skill)
    
    # Update experiences
    if 'experiences' in data:
        # Clear existing experiences
        Experience.query.filter_by(profile_id=profile.id).delete()
        # Add new experiences
        for exp_data in data['experiences']:
            if exp_data.get('title') and exp_data.get('company'):
                from datetime import datetime
                experience = Experience(
                    title=exp_data['title'],
                    company=exp_data['company'],
                    location=exp_data.get('location', ''),
                    start_date=datetime.strptime(exp_data['start_date'], '%Y-%m-%d').date() if exp_data.get('start_date') else None,
                    end_date=datetime.strptime(exp_data['end_date'], '%Y-%m-%d').date() if exp_data.get('end_date') else None,
                    description=exp_data.get('description', ''),
                    profile=profile
                )
                db.session.add(experience)
    
    # Update educations
    if 'educations' in data:
        # Clear existing educations
        Education.query.filter_by(profile_id=profile.id).delete()
        # Add new educations
        for edu_data in data['educations']:
            if edu_data.get('school'):
                education = Education(
                    school=edu_data['school'],
                    degree=edu_data.get('degree', ''),
                    field_of_study=edu_data.get('field_of_study', ''),
                    start_year=int(edu_data['start_year']) if edu_data.get('start_year') else None,
                    end_year=int(edu_data['end_year']) if edu_data.get('end_year') else None,
                    description=edu_data.get('description', ''),
                    profile=profile
                )
                db.session.add(education)
    
    db.session.commit()
    return jsonify(serialize_profile(profile)), 200

@profile_bp.route('/image', methods=['POST'])
@jwt_required()
def upload_image():
    user_id = int(get_jwt_identity())
    profile = Profile.query.filter_by(user_id=user_id).first()
    if not profile:
        return jsonify({"error": "Profile not found"}), 404
    
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No image file selected"}), 400
    
    if file and allowed_file(file.filename):
        # Create upload directory if it doesn't exist
        if not os.path.exists(UPLOAD_FOLDER):
            os.makedirs(UPLOAD_FOLDER)
        
        # Generate unique filename
        filename = secure_filename(file.filename or 'image')
        unique_filename = f"{uuid.uuid4().hex}_{filename}"
        filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
        
        # Save file
        file.save(filepath)
        
        # Update profile with image URL
        profile.image_url = f"/uploads/{unique_filename}"
        db.session.commit()
        
        return jsonify({
            "message": "Image uploaded successfully",
            "image_url": profile.image_url
        }), 200
    
    return jsonify({"error": "Invalid file type"}), 400 