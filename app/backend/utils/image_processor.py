import os
import uuid
import time
from PIL import Image
from werkzeug.utils import secure_filename
from flask import current_app
import mimetypes
import hashlib

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

def secure_filename_with_timestamp(filename):
    """Generate a secure filename with timestamp to prevent conflicts and improve security"""
    if not filename:
        return None
    
    # Get file extension
    ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    
    # Validate extension
    if ext not in current_app.config['ALLOWED_EXTENSIONS']:
        return None
    
    # Generate timestamp and hash for unique filename
    timestamp = str(int(time.time()))
    random_hash = hashlib.md5(f"{timestamp}{uuid.uuid4()}".encode()).hexdigest()[:8]
    prefix = current_app.config.get('SECURE_FILENAME_PREFIX', 'img_')
    
    # Combine prefix, timestamp, hash, and extension
    if ext:
        return f"{prefix}{timestamp}_{random_hash}.{ext}"
    return f"{prefix}{timestamp}_{random_hash}"

def create_upload_directory():
    """Create upload directory if it doesn't exist with proper permissions"""
    upload_folder = current_app.config['UPLOAD_FOLDER']
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder, mode=0o755)  # Secure directory permissions
    return upload_folder

def validate_file_content(file):
    """Validate file content by checking magic bytes"""
    try:
        # Read first few bytes to check file signature
        file.seek(0)
        header = file.read(8)
        file.seek(0)  # Reset file pointer
        
        # Check for common image file signatures
        image_signatures = [
            b'\xff\xd8\xff',  # JPEG
            b'\x89PNG\r\n\x1a\n',  # PNG
        ]
        
        for signature in image_signatures:
            if header.startswith(signature):
                return True
                
        return False
    except Exception:
        return False

def resize_image(image_path, output_path, size, quality=None):
    """Resize image to specified dimensions"""
    try:
        with Image.open(image_path) as img:
            # Convert to RGB if necessary
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')
            
            # Resize image
            img.thumbnail(size, Image.Resampling.LANCZOS)
            
            # Save with specified quality
            if quality is None:
                quality = current_app.config['COMPRESSION_QUALITY']
            
            img.save(output_path, quality=quality, optimize=True)
            return True
    except Exception as e:
        print(f"Error resizing image: {e}")
        return False

def generate_thumbnail(image_path, output_path):
    """Generate thumbnail from image"""
    thumbnail_size = current_app.config['THUMBNAIL_SIZE']
    return resize_image(image_path, output_path, thumbnail_size)

def process_profile_image(image_path, output_path):
    """Process profile image with specific dimensions"""
    profile_size = current_app.config['PROFILE_IMAGE_SIZE']
    return resize_image(image_path, output_path, profile_size)

def get_file_size_mb(file_path):
    """Get file size in MB"""
    return os.path.getsize(file_path) / (1024 * 1024)

def validate_image_file(file):
    """Enhanced validation for uploaded image file"""
    if not file:
        return False, "No file provided"
    
    if not file.filename:
        return False, "No filename provided"
    
    # Check file extension
    if not allowed_file(file.filename):
        return False, f"File type not allowed. Allowed types: {', '.join(current_app.config['ALLOWED_EXTENSIONS'])}"
    
    # Check file size
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)  # Reset file pointer
    
    max_size = current_app.config['MAX_CONTENT_LENGTH']
    if file_size > max_size:
        return False, f"File too large. Maximum size is {max_size / (1024*1024)}MB"
    
    # Check if it's actually an image by content
    if not validate_file_content(file):
        return False, "Invalid image file content"
    
    # Additional check with PIL
    try:
        with Image.open(file) as img:
            img.verify()
        file.seek(0)  # Reset file pointer after verification
    except Exception:
        return False, "Invalid image file format"
    
    return True, "File is valid"

def save_uploaded_image(file, subfolder=''):
    """Save uploaded image with enhanced security processing"""
    # Validate file
    is_valid, message = validate_image_file(file)
    if not is_valid:
        return None, message
    # Create upload directory
    upload_folder = create_upload_directory()
    # Generate secure filename with timestamp
    original_filename = secure_filename(file.filename)
    secure_name = secure_filename_with_timestamp(original_filename)
    if not secure_name:
        return None, "Failed to generate secure filename"
    # Create subfolder path
    if subfolder:
        subfolder_path = os.path.join(upload_folder, subfolder)
        if not os.path.exists(subfolder_path):
            os.makedirs(subfolder_path, mode=0o755)  # Secure permissions
        file_path = os.path.join(subfolder_path, secure_name)
    else:
        file_path = os.path.join(upload_folder, secure_name)
    # Save original file
    file.save(file_path)
    # Resize the saved image to required profile size
    process_profile_image(file_path, file_path)
    # Set secure file permissions
    os.chmod(file_path, 0o644)  # Read/write for owner, read for others
    # Generate thumbnail
    thumbnail_name = f"thumb_{secure_name}"
    if subfolder:
        thumbnail_path = os.path.join(subfolder_path, thumbnail_name)
    else:
        thumbnail_path = os.path.join(upload_folder, thumbnail_name)
    generate_thumbnail(file_path, thumbnail_path)
    # Set secure permissions for thumbnail
    if os.path.exists(thumbnail_path):
        os.chmod(thumbnail_path, 0o644)
    return {
        'original': secure_name,
        'thumbnail': thumbnail_name,
        'path': file_path,
        'thumbnail_path': thumbnail_path
    }, "File uploaded successfully" 