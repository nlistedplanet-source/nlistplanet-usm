#!/usr/bin/env python3
"""
Script to add ESDS Software company directly to MongoDB database
"""
import os
import sys
from datetime import datetime
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv('UnlistedHub-USM/backend/.env')

MONGODB_URI = os.getenv('MONGODB_URI')

if not MONGODB_URI:
    print("Error: MONGODB_URI not found in environment variables")
    sys.exit(1)

# Company data
company_data = {
    "name": "ESDS Software Solution Limited",
    "scriptName": "ESDS Software",
    "sector": "IT, Software",
    "isin": "INE0DRI01029",
    "cin": "U72200MH2005PLC15543",
    "pan": "AABCE4981A",
    "registrationDate": datetime(2005, 8, 18),
    "description": None,
    "logo": None,
    "isActive": True,
    "addedBy": "admin",
    "verificationStatus": "verified",
    "totalListings": 0
}

try:
    # Connect to MongoDB
    print("Connecting to MongoDB...")
    client = MongoClient(MONGODB_URI)
    db = client.get_default_database()
    companies_collection = db['companies']
    
    # Check if company already exists
    existing = companies_collection.find_one({"name": company_data["name"]})
    if existing:
        print(f"❌ Company '{company_data['name']}' already exists in database!")
        print(f"   ID: {existing['_id']}")
        sys.exit(0)
    
    # Check if ISIN already exists
    existing_isin = companies_collection.find_one({"isin": company_data["isin"]})
    if existing_isin:
        print(f"❌ Company with ISIN '{company_data['isin']}' already exists!")
        print(f"   Name: {existing_isin['name']}")
        print(f"   ID: {existing_isin['_id']}")
        sys.exit(0)
    
    # Insert company
    print(f"Adding company: {company_data['name']}")
    result = companies_collection.insert_one(company_data)
    
    print(f"✅ Company added successfully!")
    print(f"   ID: {result.inserted_id}")
    print(f"   Name: {company_data['name']}")
    print(f"   ISIN: {company_data['isin']}")
    print(f"   CIN: {company_data['cin']}")
    print(f"   Registration Date: {company_data['registrationDate'].strftime('%d/%m/%Y')}")
    
except Exception as e:
    print(f"❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
finally:
    if 'client' in locals():
        client.close()
