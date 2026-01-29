CREATE TABLE status_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL,  -- "2025-01-28T10:00:00+09:00"
  spots TEXT NOT NULL       -- JSON: [{"name":"...", "status":"..."}]
);

CREATE INDEX idx_snapshots_timestamp ON status_snapshots(timestamp);
