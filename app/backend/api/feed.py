from flask import Blueprint, jsonify
from models.post import Post
from models.user import User
from extensions import db

feed_bp = Blueprint('feed', __name__)
 
@feed_bp.route('/feed', methods=['GET'])
def get_feed():
    posts = Post.query.order_by(Post.created_at.desc()).all()
    result = []
    for post in posts:
        user = User.query.get(post.user_id)
        result.append({
            'id': post.id,
            'user_id': post.user_id,
            'username': user.username if user else None,
            'content': post.content,
            'media_url': post.media_url,
            'created_at': post.created_at.isoformat(),
        })
    return jsonify(result) 