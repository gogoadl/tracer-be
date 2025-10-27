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
    
    # Path to sample files
    jsonl_file = Path(__file__).parent / "data" / "sample_command_log.jsonl"
    text_file = Path(__file__).parent / "data" / "sample_command_history.txt"
    
    # Destination: ~/.command_log.jsonl
    dest_file = home_dir / ".command_log.jsonl"
    
    # Try JSONL first, fall back to text if not available
    sample_file = jsonl_file if jsonl_file.exists() else text_file
    
    # Check if sample file exists
    if not sample_file.exists():
        print(f"[X] Sample file not found at: {sample_file}")
        print("Creating JSONL from text file...")
        from create_sample_jsonl import create_sample_jsonl
        create_sample_jsonl()
        sample_file = jsonl_file
    
    # Copy the file
    try:
        shutil.copy2(sample_file, dest_file)
        print(f"[OK] Sample data copied to: {dest_file}")
        print(f"[INFO] Total lines: {sum(1 for _ in dest_file.open())}")
        print("\n[TIP] You can now run the backend and it will load this data:")
        print("   cd app")
        print("   uvicorn main:app --reload")
    except Exception as e:
        print(f"[ERROR] Error copying file: {e}")

if __name__ == "__main__":
    setup_sample_data()

