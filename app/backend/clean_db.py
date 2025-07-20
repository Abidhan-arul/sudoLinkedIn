#!/usr/bin/env python3
"""
Alternative Database Clean Script
This script provides a simpler way to reset the database using Flask CLI.
"""

import os
import subprocess
import sys

def clean_database():
    """Clean the database using Flask CLI commands"""
    print("🧹 Starting database cleanup...")
    
    try:
        # Change to backend directory
        os.chdir('app/backend')
        
        # Set Flask app environment variable
        os.environ['FLASK_APP'] = 'main.py'
        
        print("🗑️  Dropping all tables...")
        # Drop all tables
        result = subprocess.run([
            'python', '-m', 'flask', 'db', 'downgrade', 'base'
        ], capture_output=True, text=True)
        
        if result.returncode != 0:
            print("⚠️  Note: Downgrade to base failed (this is normal if no migrations exist)")
        
        print("✨ Upgrading to latest migration...")
        # Upgrade to latest migration
        result = subprocess.run([
            'python', '-m', 'flask', 'db', 'upgrade'
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Database cleaned successfully!")
            print("\n📝 Database is now in a clean state with:")
            print("- All tables recreated from migrations")
            print("- No sample data")
            print("- Ready for testing")
        else:
            print(f"❌ Error during upgrade: {result.stderr}")
            sys.exit(1)
            
    except Exception as e:
        print(f"❌ Error cleaning database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    clean_database() 