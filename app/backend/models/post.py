from extensions import db
from datetime import datetime

class Post(db.Model):
    __tablename__ = 'posts'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    media_url = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, index=True, default=db.func.now())
    category = db.Column(db.String(64), index=True)
    tags = db.Column(db.String(255), index=True)
    visibility = db.Column(db.String(32), default='public')
    likes_count = db.Column(db.Integer, default=0)
    views_count = db.Column(db.Integer, default=0)

    user = db.relationship('User', backref=db.backref('posts', lazy=True))
