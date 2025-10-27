#!/usr/bin/env python
"""
Convert sample_command_history.txt to JSONL format
"""
import json
import re
from datetime import datetime
from pathlib import Path

def create_sample_jsonl():
    """Convert sample text file to JSONL format"""
    # Get paths
    base_dir = Path(__file__).parent
    text_file = base_dir / "data" / "sample_command_history.txt"
    jsonl_file = base_dir / "data" / "sample_command_log.jsonl"
    
    if not text_file.exists():
        print(f"❌ Sample file not found at: {text_file}")
        return
    
    # Read and convert
    output_lines = []
    with open(text_file, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            
            # Parse format: 2025-01-15 10:30:45 [user] ~/project: command
            pattern = r'(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})\s+\[([^\]]+)\]\s+(.*?):\s+(.+)$'
            match = re.match(pattern, line)
            
            if match:
                date_str, time_str, user, directory, command = match.groups()
                timestamp_str = f"{date_str}T{time_str}"
                
                json_obj = {
                    "timestamp": timestamp_str,
                    "user": user,
                    "directory": directory,
                    "command": command
                }
                
                output_lines.append(json.dumps(json_obj))
    
    # Write to file
    with open(jsonl_file, 'w', encoding='utf-8') as f:
        for line in output_lines:
            f.write(line + '\n')
    
    print(f"✅ Created sample JSONL file: {jsonl_file}")
    print(f"📊 Total lines: {len(output_lines)}")

if __name__ == "__main__":
    create_sample_jsonl()

