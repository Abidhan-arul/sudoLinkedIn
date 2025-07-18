import os
import re
from typing import Tuple, Optional
from flask import current_app, request, abort
import mimetypes

def sanitize_filename(filename: str) -> Optional[str]:
    """Sanitize filename to prevent security issues"""
    if not filename:
        return None
    
    # Remove any path separators
    filename = os.path.basename(filename)
    
    # Remove any null bytes
    filename = filename.replace('\x00', '')
    
    # Only allow alphanumeric, dots, hyphens, and underscores
    filename = re.sub(r'[^a-zA-Z0-9._-]', '', filename)
    
    # Prevent double extensions
    if filename.count('.') > 1:
        return None
    
    return filename

def validate_file_path(file_path: str, base_path: str) -> bool:
    """Validate that file path is within the allowed base path"""
    try:
        real_file_path = os.path.realpath(file_path)
        real_base_path = os.path.realpath(base_path)
        return real_file_path.startswith(real_base_path)
    except (OSError, ValueError):
        return False

def check_file_permissions(file_path: str) -> bool:
    """Check if file has appropriate permissions"""
    try:
        # Check if file is readable
        if not os.access(file_path, os.R_OK):
            return False
        
        # Check if file is not executable
        if os.access(file_path, os.X_OK):
            return False
        
        return True
    except OSError:
        return False

def validate_content_type(file_path: str, allowed_types: set) -> bool:
    """Validate file content type using magic bytes"""
    try:
        with open(file_path, 'rb') as f:
            header = f.read(8)
        
        # Check for image signatures
        image_signatures = {
            b'\xff\xd8\xff': 'image/jpeg',
            b'\x89PNG\r\n\x1a\n': 'image/png',
        }
        
        for signature, mime_type in image_signatures.items():
            if header.startswith(signature):
                return mime_type in allowed_types
        
        return False
    except Exception:
        return False

def get_secure_file_info(file_path: str) -> Tuple[bool, str]:
    """Get secure file information"""
    try:
        if not os.path.exists(file_path):
            return False, "File does not exist"
        
        if not os.path.isfile(file_path):
            return False, "Path is not a file"
        
        if not check_file_permissions(file_path):
            return False, "Insufficient file permissions"
        
        # Check file size
        file_size = os.path.getsize(file_path)
        max_size = current_app.config.get('MAX_CONTENT_LENGTH', 5 * 1024 * 1024)
        if file_size > max_size:
            return False, "File too large"
        
        return True, "File is valid"
    except Exception as e:
        return False, f"Error checking file: {str(e)}"

def validate_upload_request() -> Tuple[bool, str]:
    """Validate upload request for security"""
    # Check content type
    content_type = request.content_type or ''
    if not content_type.startswith('multipart/form-data'):
        return False, "Invalid content type"
    
    # Check content length
    content_length = request.content_length
    max_length = current_app.config.get('MAX_CONTENT_LENGTH', 5 * 1024 * 1024)
    if content_length and content_length > max_length:
        return False, "Request too large"
    
    return True, "Request is valid"

def create_secure_directory(path: str) -> bool:
    """Create directory with secure permissions"""
    try:
        if not os.path.exists(path):
            os.makedirs(path, mode=0o755)
        return True
    except Exception:
        return False

def set_secure_file_permissions(file_path: str) -> bool:
    """Set secure file permissions"""
    try:
        os.chmod(file_path, 0o644)  # Read/write for owner, read for others
        return True
    except Exception:
        return False 