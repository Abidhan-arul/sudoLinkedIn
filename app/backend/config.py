import os
from datetime import timedelta

class Config:
    # Flask
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev')
    
    # Database
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'mysql://abidhan:Abidhan%402004@localhost/prok_db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    
    # CORS
    CORS_HEADERS = 'Content-Type' 
    
    # File Upload Configuration
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', 'uploads')
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5MB max file size (reduced from 16MB)
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'tiff', 'svg'}  # Allow all common image formats
    THUMBNAIL_SIZE = (150, 150)
    PROFILE_IMAGE_SIZE = (400, 400)
    COMPRESSION_QUALITY = 85
    SECURE_FILENAME_PREFIX = 'img_'  # Prefix for secure filenames 