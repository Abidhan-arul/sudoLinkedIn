from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
import os
from extensions import db
from models.post import Post
from models.user import User
from datetime import datetime
from collections import Counter

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

@posts_bp.route('/api/posts', methods=['GET'])
def list_posts():
    # Pagination
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    # Filtering
    category = request.args.get('category')
    tags = request.args.get('tags')  # comma-separated
    search = request.args.get('search')
    visibility = request.args.get('visibility')
    # Sorting
    sort = request.args.get('sort', 'created_at')
    order = request.args.get('order', 'desc')

    query = Post.query
    if category:
        query = query.filter(Post.category == category)
    if tags:
        tag_list = [t.strip() for t in tags.split(',') if t.strip()]
        for tag in tag_list:
            query = query.filter(Post.tags.like(f'%{tag}%'))
    if search:
        query = query.filter(Post.content.ilike(f'%{search}%'))
    if visibility:
        query = query.filter(Post.visibility == visibility)
    # Sorting
    if sort in ['created_at', 'likes_count', 'views_count']:
        sort_col = getattr(Post, sort)
        if order == 'asc':
            query = query.order_by(sort_col.asc())
        else:
            query = query.order_by(sort_col.desc())
    else:
        query = query.order_by(Post.created_at.desc())
    # Pagination
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    posts = pagination.items
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
            'category': getattr(post, 'category', None),
            'tags': getattr(post, 'tags', '').split(',') if getattr(post, 'tags', None) else [],
            'visibility': getattr(post, 'visibility', None),
            'likes_count': getattr(post, 'likes_count', 0),
            'views_count': getattr(post, 'views_count', 0),
        })
    return jsonify({
        'posts': result,
        'total': pagination.total,
        'page': page,
        'per_page': per_page,
        'pages': pagination.pages
    }) 

# Simple in-memory cache
category_cache = {'data': None, 'timestamp': 0}
tag_cache = {'data': None, 'timestamp': 0}
CACHE_TTL = 60  # seconds

def invalidate_post_cache():
    category_cache['data'] = None
    tag_cache['data'] = None

@posts_bp.route('/api/posts/categories', methods=['GET'])
def get_categories():
    import time
    now = time.time()
    if category_cache['data'] and now - category_cache['timestamp'] < CACHE_TTL:
        return jsonify({'categories': category_cache['data']})
    categories = db.session.query(Post.category).distinct().all()
    categories = [c[0] for c in categories if c[0]]
    category_cache['data'] = categories
    category_cache['timestamp'] = now
    return jsonify({'categories': categories})

@posts_bp.route('/api/posts/popular-tags', methods=['GET'])
def get_popular_tags():
    import time
    now = time.time()
    if tag_cache['data'] and now - tag_cache['timestamp'] < CACHE_TTL:
        return jsonify({'tags': tag_cache['data']})
    all_tags = db.session.query(Post.tags).all()
    tag_list = []
    for tags in all_tags:
        if tags[0]:
            tag_list.extend([t.strip() for t in tags[0].split(',') if t.strip()])
    counter = Counter(tag_list)
    popular = [tag for tag, _ in counter.most_common(10)]
    tag_cache['data'] = popular
    tag_cache['timestamp'] = now
    return jsonify({'tags': popular})

# Invalidate cache on post create/update/delete
# Call invalidate_post_cache() in your POST/PUT/DELETE endpoints for posts 