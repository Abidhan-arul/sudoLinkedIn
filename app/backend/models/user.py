from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import re
from extensions import db  # ✅ Import shared db instance
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    # Profile relationship
    profile = db.relationship('Profile', backref='user', uselist=False, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<User {self.username}>'

    def set_password(self, password):
        if not self.is_password_complex(password):
            raise ValueError("Password does not meet complexity requirements.")
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    @staticmethod
    def is_password_complex(password):
        pattern = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$'
        return re.match(pattern, password) is not None

    @classmethod
    def is_username_unique(cls, username):
        return cls.query.filter_by(username=username).first() is None

    @classmethod
    def is_email_unique(cls, email):
        return cls.query.filter_by(email=email).first() is None

    def save(self):
        if not self.is_username_unique(self.username):
            raise ValueError("Username already exists.")
        if not self.is_email_unique(self.email):
            raise ValueError("Email already exists.")
        db.session.add(self)
        db.session.commit()

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'profile': self.profile.to_dict() if self.profile else None
        }

