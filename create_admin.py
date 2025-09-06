#!/usr/bin/env python3
"""
Script to create an admin user for TradingGrow
"""
import os
import sys
from app import app
from models import User

def create_admin_user():
    """Create an admin user"""
    with app.app_context():
        # Check if admin already exists
        admin_email = "admin@tradinggrow.com"
        existing_admin = User.get_by_email(admin_email)
        
        if existing_admin:
            print(f"Admin user {admin_email} already exists!")
            if existing_admin.is_admin:
                print("User is already an admin.")
            else:
                # Make existing user an admin
                existing_admin.is_admin = True
                existing_admin.save()
                print(f"Made {admin_email} an admin user.")
            return existing_admin
        
        # Create new admin user
        admin_password = "admin123"  # Change this in production!
        admin_user = User.create_admin(
            email=admin_email,
            password=admin_password,
            full_name="TradingGrow Admin"
        )
        
        print(f"✅ Created admin user:")
        print(f"   Email: {admin_email}")
        print(f"   Password: {admin_password}")
        print(f"   Login at: /admin/login")
        print()
        print("⚠️  IMPORTANT: Change the default password after first login!")
        
        return admin_user

if __name__ == "__main__":
    create_admin_user()