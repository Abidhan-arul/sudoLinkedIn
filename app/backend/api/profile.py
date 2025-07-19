from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.profile import Profile, Skill, Experience, Education
from extensions import db

profile_bp = Blueprint('profile', __name__, url_prefix='/api/profile')

def serialize_profile(profile):
    return {
        "full_name": profile.full_name,
        "headline": profile.headline,
        "summary": profile.summary,
        "location": profile.location,
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
    user_id = get_jwt_identity()
    profile = Profile.query.filter_by(user_id=user_id).first()
    if not profile:
        return jsonify({"error": "Profile not found"}), 404
    return jsonify(serialize_profile(profile)), 200 