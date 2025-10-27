"""
Test file watch functionality
"""
import requests
import time

BASE_URL = "http://localhost:8000"

def test_file_watch():
    print("Testing File Watch API...")
    
    # 1. Check if server is running
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"✅ Server is running: {response.json()}")
    except Exception as e:
        print(f"❌ Server is not running: {e}")
        return
    
    # 2. Get current watch folders
    print("\n2. Getting current watch folders...")
    try:
        response = requests.get(f"{BASE_URL}/api/folders")
        folders = response.json().get('folders', [])
        print(f"Current folders: {len(folders)}")
        for folder in folders:
            print(f"  - {folder['path']} (Active: {folder['is_active']})")
    except Exception as e:
        print(f"Error: {e}")
    
    # 3. Add a test folder
    print("\n3. Adding test folder...")
    test_path = r"C:\Users\A93220\Documents\GitHub\hyeonwoo\knowledge"
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/folders/add",
            params={
                "path": test_path,
                "file_patterns": "*.md",
                "recursive": True
            }
        )
        if response.status_code == 200:
            print(f"✅ Folder added successfully")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Error adding folder: {e}")
    
    # 4. Get file changes
    print("\n4. Getting file changes...")
    try:
        response = requests.get(f"{BASE_URL}/api/changes?limit=10")
        data = response.json()
        print(f"Total changes: {data.get('total', 0)}")
        changes = data.get('changes', [])
        if changes:
            print("\nRecent changes:")
            for change in changes[:5]:
                print(f"  - {change.get('file_name')} ({change.get('event_type')}) at {change.get('timestamp')}")
        else:
            print("No changes found")
    except Exception as e:
        print(f"Error: {e}")
    
    # 5. Get stats
    print("\n5. Getting stats...")
    try:
        response = requests.get(f"{BASE_URL}/api/changes/stats")
        stats = response.json()
        print(f"Total changes: {stats.get('total_changes', 0)}")
        print(f"Event types: {stats.get('event_types', {})}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_file_watch()

