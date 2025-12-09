#!/usr/bin/env python3
"""
Update admin username to look like normal user (trader_xyz format)
"""
import os
import sys
import random
import string
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv('UnlistedHub-USM/backend/.env')

MONGODB_URI = os.getenv('MONGODB_URI')

if not MONGODB_URI:
    print("Error: MONGODB_URI not found")
    sys.exit(1)

def generate_trader_username():
    """Generate a random short trader username"""
    suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=3))
    return f'trader_{suffix}'

try:
    # Connect to MongoDB
    print("Connecting to MongoDB...")
    client = MongoClient(MONGODB_URI)
    db = client.get_default_database()
    users_collection = db['users']
    
    # Find admin user
    admin_user = users_collection.find_one({"role": "admin"})
    
    if not admin_user:
        print("❌ Admin user not found!")
        sys.exit(1)
    
    old_username = admin_user.get('username', 'N/A')
    print(f"\nCurrent admin username: {old_username}")
    
    # Generate new trader-style username
    new_username = generate_trader_username()
    
    # Check if username already exists
    while users_collection.find_one({"username": new_username}):
        new_username = generate_trader_username()
    
    print(f"New username: {new_username}")
    
    # Update username
    result = users_collection.update_one(
        {"_id": admin_user["_id"]},
        {"$set": {"username": new_username}}
    )
    
    if result.modified_count > 0:
        print(f"\n✅ Admin username updated successfully!")
        print(f"   Old: {old_username}")
        print(f"   New: {new_username}")
        print(f"\n⚠️  Note: Username will show as '@{new_username}' in the app")
    else:
        print("❌ Failed to update username")
    
except Exception as e:
    print(f"❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
finally:
    if 'client' in locals():
        client.close()
