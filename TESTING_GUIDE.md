# 🧪 Testing Guide

## 🚀 Quick Start

### 1. Backend Setup
```bash
cd app/backend
python setup_db.py
pip install -r requirements.txt
python -m flask run --host=0.0.0.0 --port=5000
```

### 2. Frontend Setup
```bash
cd app/frontend
npm install
npm run dev
```

### 3. Access URLs
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 📋 Testing Checklist

### ✅ Authentication Testing
1. **User Registration**
   - Go to http://localhost:5173
   - Click "Sign Up"
   - Fill in username, email, password
   - Verify successful registration

2. **User Login**
   - Use registered credentials
   - Verify JWT token is stored
   - Check redirect to dashboard

### ✅ Profile Management Testing

#### **Profile Data Endpoints**
1. **GET /api/profile**
   ```bash
   curl -X GET http://localhost:5000/api/profile \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```
   - Should return user profile data
   - Should include image URLs if available

2. **PUT /api/profile**
   ```bash
   curl -X PUT http://localhost:5000/api/profile \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"full_name": "John Doe", "headline": "Software Engineer"}'
   ```
   - Should update profile successfully
   - Should return updated profile data

#### **Profile Image Upload**
1. **POST /api/profile/image**
   ```bash
   curl -X POST http://localhost:5000/api/profile/image \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -F "image=@/path/to/test-image.jpg"
   ```
   - Should upload image successfully
   - Should return image URLs
   - Should create thumbnail

2. **Image Serving**
   ```bash
   curl -X GET http://localhost:5000/api/images/profile/FILENAME \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```
   - Should serve image file
   - Should include security headers

### ✅ Frontend Testing

#### **Profile View Component**
1. **Load Profile Page**
   - Navigate to profile section
   - Verify loading spinner appears
   - Verify profile data loads correctly

2. **Edit Profile**
   - Modify profile fields
   - Verify auto-save functionality
   - Check for success/error messages

3. **Upload Profile Image**
   - Click camera icon on profile image
   - Select image file (JPG/PNG)
   - Verify upload progress
   - Check image updates in UI

#### **Error Handling**
1. **Network Errors**
   - Disconnect internet
   - Try to update profile
   - Verify offline indicator appears
   - Reconnect and verify sync

2. **Invalid File Upload**
   - Try uploading non-image file
   - Try uploading file > 5MB
   - Try uploading unsupported format
   - Verify appropriate error messages

### ✅ Security Testing

#### **File Validation**
1. **File Type Restrictions**
   ```bash
   # Try uploading different file types
   curl -X POST http://localhost:5000/api/profile/image \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -F "image=@test.txt"
   ```
   - Should reject non-image files
   - Should reject files with wrong extensions

2. **File Size Limits**
   ```bash
   # Create a large file (>5MB)
   dd if=/dev/zero of=large.jpg bs=1M count=6
   curl -X POST http://localhost:5000/api/profile/image \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -F "image=@large.jpg"
   ```
   - Should reject files > 5MB

#### **Access Control**
1. **Unauthorized Access**
   ```bash
   # Try accessing without token
   curl -X GET http://localhost:5000/api/profile
   ```
   - Should return 401 Unauthorized

2. **Cross-User Access**
   ```bash
   # Try accessing another user's image
   curl -X GET http://localhost:5000/api/images/profile/OTHER_USER_IMAGE \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```
   - Should return 403 Forbidden

#### **Path Traversal Protection**
1. **Malicious Filenames**
   ```bash
   curl -X POST http://localhost:5000/api/profile/image \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -F "image=@test.jpg;filename=../../../etc/passwd"
   ```
   - Should sanitize filename
   - Should prevent directory traversal

### ✅ Performance Testing

#### **Caching**
1. **Profile Data Caching**
   - Load profile page
   - Reload page quickly
   - Verify cached data loads instantly
   - Check cache expiration (5 minutes)

2. **Image Caching**
   - Load profile with image
   - Check browser cache headers
   - Verify images load from cache on reload

#### **Image Processing**
1. **Thumbnail Generation**
   - Upload large image
   - Verify thumbnail is created
   - Check thumbnail size (150x150)
   - Verify compression quality

### ✅ Offline Testing

1. **Offline Mode**
   - Disconnect internet
   - Try to edit profile
   - Verify offline indicator
   - Verify changes are cached
   - Reconnect and verify sync

2. **Cache Persistence**
   - Close browser
   - Reopen and go offline
   - Verify cached data is available

## 🐛 Common Issues & Solutions

### **Backend Issues**
1. **Database Connection Error**
   - Check MySQL service is running
   - Verify database credentials in config.py
   - Run `python setup_db.py` again

2. **Import Errors**
   - Ensure all packages are installed: `pip install -r requirements.txt`
   - Check Python path and virtual environment

3. **Permission Errors**
   - Check uploads directory permissions
   - Run: `chmod 755 uploads/`

### **Frontend Issues**
1. **API Connection Error**
   - Verify backend is running on port 5000
   - Check CORS settings
   - Verify API_URL in api.ts

2. **Build Errors**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check TypeScript errors
   - Verify all dependencies are installed

### **File Upload Issues**
1. **Upload Fails**
   - Check file size (< 5MB)
   - Verify file type (JPG/PNG only)
   - Check uploads directory exists
   - Verify file permissions

2. **Image Not Displaying**
   - Check image URL in browser
   - Verify JWT token is valid
   - Check file exists in uploads directory

## 📊 Test Results Template

```
✅ Authentication
  - Registration: PASS/FAIL
  - Login: PASS/FAIL
  - Token Storage: PASS/FAIL

✅ Profile Management
  - GET Profile: PASS/FAIL
  - PUT Profile: PASS/FAIL
  - Image Upload: PASS/FAIL
  - Image Serving: PASS/FAIL

✅ Frontend Features
  - Profile Loading: PASS/FAIL
  - Profile Editing: PASS/FAIL
  - Image Upload UI: PASS/FAIL
  - Error Handling: PASS/FAIL

✅ Security
  - File Validation: PASS/FAIL
  - Access Control: PASS/FAIL
  - Path Traversal: PASS/FAIL
  - File Size Limits: PASS/FAIL

✅ Performance
  - Caching: PASS/FAIL
  - Image Processing: PASS/FAIL
  - Offline Support: PASS/FAIL
```

## 🎯 Success Criteria

All tests should pass for a successful implementation:
- ✅ User can register and login
- ✅ Profile data can be viewed and edited
- ✅ Profile images can be uploaded and displayed
- ✅ Security measures prevent unauthorized access
- ✅ Offline functionality works correctly
- ✅ Performance is acceptable (fast loading, caching)

## 🚨 Security Checklist

- [ ] File type validation working
- [ ] File size limits enforced
- [ ] Authentication required for all endpoints
- [ ] Path traversal attacks prevented
- [ ] Secure file naming implemented
- [ ] Proper file permissions set
- [ ] Security headers present
- [ ] Error messages don't leak information 