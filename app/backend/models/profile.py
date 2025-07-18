from flask_sqlalchemy import SQLAlchemy
from extensions import db


class Profile(db.Model):
    __tablename__ = 'profiles'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    full_name = db.Column(db.String(120), nullable=False)
    headline = db.Column(db.String(255))
    summary = db.Column(db.Text)
    location = db.Column(db.String(120))
    profile_image = db.Column(db.String(255))
    profile_thumbnail = db.Column(db.String(255))
    about = db.Column(db.Text)
    skills = db.Column(db.Text)  # Comma-separated list
    email = db.Column(db.String(120))
    # Remove the duplicate user relationship - it's already defined in User model
    experiences = db.relationship('Experience', backref='profile', cascade='all, delete-orphan')
    educations = db.relationship('Education', backref='profile', cascade='all, delete-orphan')

    def to_dict(self):
        """Convert profile to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'full_name': self.full_name,
            'headline': self.headline,
            'summary': self.summary,
            'location': self.location,
            'profile_image': self.profile_image,
            'profile_thumbnail': self.profile_thumbnail,
            'about': self.about,
            'skills': self.skills.split(',') if self.skills else [],
            'email': self.email
        }

class Skill(db.Model):
    __tablename__ = 'skills'
    id = db.Column(db.Integer, primary_key=True)
    profile_id = db.Column(db.Integer, db.ForeignKey('profiles.id'), nullable=False)
    name = db.Column(db.String(80), nullable=False)

class Experience(db.Model):
    __tablename__ = 'experiences'
    id = db.Column(db.Integer, primary_key=True)
    profile_id = db.Column(db.Integer, db.ForeignKey('profiles.id'), nullable=False)
    title = db.Column(db.String(120), nullable=False)
    company = db.Column(db.String(120), nullable=False)
    location = db.Column(db.String(120))
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date)
    description = db.Column(db.Text)

class Education(db.Model):
    __tablename__ = 'educations'
    id = db.Column(db.Integer, primary_key=True)
    profile_id = db.Column(db.Integer, db.ForeignKey('profiles.id'), nullable=False)
    school = db.Column(db.String(120), nullable=False)
    degree = db.Column(db.String(120))
    field_of_study = db.Column(db.String(120))
    start_year = db.Column(db.Integer)
    end_year = db.Column(db.Integer)
    description = db.Column(db.Text)
