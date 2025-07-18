#!/usr/bin/env python3
"""
Simple database setup script for beginners.
Uses db.create_all() instead of complex migrations.
"""

from main import create_app
from extensions import db
from models.user import User
from models.profile import Profile, Skill, Experience, Education

def setup_database():
    """Create all database tables"""
    app = create_app()
    
    with app.app_context():
        print("Creating database tables...")
        db.create_all()
        print("Database tables created successfully!")
        
        # Create uploads directory
        import os
        upload_folder = app.config.get('UPLOAD_FOLDER', 'uploads')
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder, mode=0o755)
            print(f"Created uploads directory: {upload_folder}")
        
        # Create subdirectories
        subdirs = ['profile', 'posts']
        for subdir in subdirs:
            subdir_path = os.path.join(upload_folder, subdir)
            if not os.path.exists(subdir_path):
                os.makedirs(subdir_path, mode=0o755)
                print(f"Created subdirectory: {subdir_path}")
        
        print("Database setup complete!")

if __name__ == '__main__':
    setup_database() 