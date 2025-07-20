#!/usr/bin/env python3
"""
Database Reset Script
This script resets the database to a clean state by dropping all tables
and recreating them using Alembic migrations.
"""

import os
import sys
from sqlalchemy import create_engine, text
from config import Config

def reset_database():
    """Reset the database to a clean state"""
    print("🔄 Starting database reset...")
    
    # Create engine without database name to connect to MySQL server
    db_uri = Config.SQLALCHEMY_DATABASE_URI
    db_name = db_uri.split('/')[-1]
    server_uri = '/'.join(db_uri.split('/')[:-1])
    
    print(f"📊 Database: {db_name}")
    print(f"🔗 Server: {server_uri}")
    
    try:
        # Connect to MySQL server (without specific database)
        engine = create_engine(server_uri)
        
        with engine.connect() as conn:
            # Drop database if it exists
            print(f"🗑️  Dropping database '{db_name}' if it exists...")
            conn.execute(text(f"DROP DATABASE IF EXISTS `{db_name}`"))
            conn.commit()
            
            # Create fresh database
            print(f"✨ Creating fresh database '{db_name}'...")
            conn.execute(text(f"CREATE DATABASE `{db_name}`"))
            conn.commit()
            
        print("✅ Database reset completed successfully!")
        print("\n📝 Next steps:")
        print("1. Run: cd app/backend && python -m flask db upgrade")
        print("2. Start your application")
        
    except Exception as e:
        print(f"❌ Error resetting database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    reset_database() 