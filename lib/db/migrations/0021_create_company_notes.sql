-- Company notes table (single statement)
CREATE TABLE IF NOT EXISTS company_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);


