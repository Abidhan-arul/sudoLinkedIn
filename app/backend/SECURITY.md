# Security Features for File Upload and Serving

## Overview
This document outlines the security measures implemented for file upload and serving functionality.

## File Validation

### File Type Restrictions
- **Allowed formats**: Only PNG, JPG, JPEG files are accepted
- **File extension validation**: Strict checking of file extensions
- **Content validation**: Magic bytes verification to ensure files are actually images
- **MIME type validation**: Additional content-type checking

### File Size Limits
- **Maximum file size**: 5MB per file
- **Request size validation**: Checks both individual file and total request size
- **Configurable limits**: All limits can be adjusted in `config.py`

### File Naming Security
- **Timestamp-based naming**: Files are renamed using timestamps and hashes
- **Secure prefix**: All files start with `img_` prefix
- **No path traversal**: Original filenames are completely sanitized
- **Unique naming**: Prevents filename conflicts and guessing

## File Storage Security

### Directory Structure
```
uploads/
├── profile/     # Profile images
└── posts/       # Post images
```

### File Permissions
- **Directory permissions**: 755 (rwxr-xr-x)
- **File permissions**: 644 (rw-r--r--)
- **No executable files**: Files are never marked as executable

### Path Security
- **Directory traversal prevention**: All paths are validated
- **Real path checking**: Uses `os.path.realpath()` to prevent symlink attacks
- **Base path validation**: Ensures files stay within upload directory

## File Serving Security

### Access Control
- **Authentication required**: All file access requires valid JWT token
- **User-specific access**: Users can only access their own profile images
- **Role-based access**: Different access levels for different file types

### Request Validation
- **Filename sanitization**: All filenames are validated and sanitized
- **Path validation**: Subfolder and filename patterns are strictly checked
- **Content-type headers**: Proper MIME type headers are set

### Security Headers
- **Cache-Control**: Public caching with 1-hour expiration
- **X-Content-Type-Options**: nosniff to prevent MIME type sniffing
- **X-Frame-Options**: DENY to prevent clickjacking

## Upload Process Security

### Request Validation
- **Content-type checking**: Only multipart/form-data requests accepted
- **Request size limits**: Prevents large request attacks
- **File presence validation**: Ensures required files are present

### File Processing
- **Image verification**: PIL verification of image files
- **Thumbnail generation**: Automatic thumbnail creation for performance
- **Format conversion**: Images are converted to RGB for consistency

## Error Handling

### Secure Error Responses
- **No information leakage**: Error messages don't reveal system details
- **Consistent error format**: All errors follow the same JSON structure
- **Proper HTTP status codes**: Appropriate status codes for different errors

### Exception Handling
- **Graceful degradation**: System continues to function even with errors
- **Logging**: All security events are logged for monitoring
- **Fallback mechanisms**: Secure fallbacks for edge cases

## Configuration

### Security Settings
```python
# File upload configuration
UPLOAD_FOLDER = 'uploads'
MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5MB
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
SECURE_FILENAME_PREFIX = 'img_'
```

### Environment Variables
- `UPLOAD_FOLDER`: Custom upload directory path
- `MAX_CONTENT_LENGTH`: Maximum file size limit

## Best Practices

### For Developers
1. Always validate file types and sizes
2. Use secure file naming conventions
3. Implement proper access controls
4. Set appropriate file permissions
5. Monitor for suspicious upload patterns

### For Deployment
1. Use HTTPS in production
2. Configure proper web server security headers
3. Monitor upload directory for unusual activity
4. Regular security audits of uploaded files
5. Backup upload directory regularly

## Monitoring and Logging

### Security Events to Monitor
- Failed upload attempts
- Large file uploads
- Unusual file types
- Access to non-owned files
- Directory traversal attempts

### Recommended Logging
- All file upload attempts (success/failure)
- File access patterns
- Security violations
- System errors related to file operations 