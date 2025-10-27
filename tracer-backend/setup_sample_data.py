#!/usr/bin/env python
"""
Script to copy sample command history to home directory for testing.
Usage: python setup_sample_data.py
"""
import shutil
from pathlib import Path

def setup_sample_data():
    """Copy sample command history to home directory."""
    # Get the home directory
    home_dir = Path.home()
    
    # Path to sample file
    sample_file = Path(__file__).parent / "data" / "sample_command_history.txt"
    
    # Destination: ~/.command_history
    dest_file = home_dir / ".command_history"
    
    # Check if sample file exists
    if not sample_file.exists():
        print(f"❌ Sample file not found at: {sample_file}")
        return
    
    # Copy the file
    try:
        shutil.copy2(sample_file, dest_file)
        print(f"✅ Sample data copied to: {dest_file}")
        print(f"📊 Total lines: {sum(1 for _ in dest_file.open())}")
        print("\n💡 You can now run the backend and it will load this data:")
        print("   cd app")
        print("   uvicorn main:app --reload")
    except Exception as e:
        print(f"❌ Error copying file: {e}")

if __name__ == "__main__":
    setup_sample_data()

