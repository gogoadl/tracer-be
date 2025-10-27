"""
Add file_changes table to existing database
"""
import sqlite3
from pathlib import Path

DB_PATH = Path("data/logs.db")

if not DB_PATH.exists():
    print(f"❌ Database not found at {DB_PATH}")
    print("Start the backend server first to create the database")
    exit(1)

# Read SQL file
with open("create_file_changes_table.sql", "r", encoding="utf-8") as f:
    sql = f.read()

print("Adding file_changes table to database...")
print(f"Database: {DB_PATH}")

conn = sqlite3.connect(str(DB_PATH))
cursor = conn.cursor()

try:
    # Execute SQL
    cursor.executescript(sql)
    conn.commit()
    
    # Show tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    
    print("\n✅ Tables in database:")
    for table in tables:
        print(f"  - {table[0]}")
    
    print("\n✅ file_changes table created successfully!")
    
except sqlite3.OperationalError as e:
    if "already exists" in str(e):
        print("✅ file_changes table already exists")
    else:
        print(f"❌ Error: {e}")
        conn.rollback()

conn.close()

