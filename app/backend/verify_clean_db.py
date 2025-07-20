#!/usr/bin/env python3
"""
Database Verification Script
This script verifies that the database is in a clean state.
"""

from main import create_app
from extensions import db
from models.user import User
from models.profile import Profile

def verify_clean_database():
    """Verify the database is clean"""
    print("🔍 Verifying database state...")
    
    app = create_app()
    with app.app_context():
        try:
            # Check user count
            user_count = User.query.count()
            print(f"👥 Users: {user_count}")
            
            # Check profile count
            profile_count = Profile.query.count()
            print(f"📋 Profiles: {profile_count}")
            
            if user_count == 0 and profile_count == 0:
                print("✅ Database is clean - no data found!")
                print("\n🎉 Ready for testing post creation!")
            else:
                print("⚠️  Database still contains data:")
                print(f"   - {user_count} users")
                print(f"   - {profile_count} profiles")
                
        except Exception as e:
            print(f"❌ Error verifying database: {e}")

if __name__ == "__main__":
    verify_clean_database() 