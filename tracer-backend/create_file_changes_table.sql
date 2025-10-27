-- Create file_changes table
CREATE TABLE IF NOT EXISTS file_changes (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME NOT NULL,
    date VARCHAR NOT NULL,
    event_type VARCHAR NOT NULL,
    file_path VARCHAR NOT NULL,
    directory VARCHAR NOT NULL,
    file_name VARCHAR NOT NULL,
    file_extension VARCHAR,
    size INTEGER,
    is_directory VARCHAR DEFAULT 'False',
    src_path VARCHAR,
    raw_data TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS ix_file_changes_timestamp ON file_changes(timestamp);
CREATE INDEX IF NOT EXISTS ix_file_changes_date ON file_changes(date);

-- Show tables
SELECT name FROM sqlite_master WHERE type='table';

