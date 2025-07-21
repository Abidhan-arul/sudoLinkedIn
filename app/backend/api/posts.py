from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
import os
from extensions import db
from models.post import Post
from models.user import User
from datetime import datetime

posts_bp = Blueprint('posts', __name__)
 
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'mov', 'avi'}
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'uploads')

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@posts_bp.route('/api/posts', methods=['POST'])
def create_post():
    user_id = request.form.get('user_id')
    content = request.form.get('content')
    file = request.files.get('media')

    if not user_id or not content:
        return jsonify({'error': 'user_id and content are required'}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    media_url = None
    if file and allowed_file(file.filename):
        filename = secure_filename(f"{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{file.filename}")
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)
        media_url = f"/uploads/{filename}"
    elif file:
        return jsonify({'error': 'Invalid file type'}), 400

    post = Post(user_id=user_id, content=content, media_url=media_url)
    db.session.add(post)
    db.session.commit()

    return jsonify({
        'id': post.id,
        'user_id': post.user_id,
        'content': post.content,
        'media_url': post.media_url,
        'created_at': post.created_at.isoformat()
    }), 201 