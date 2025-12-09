CREATE TABLE companies_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  website TEXT,
  linkedin_url TEXT,
  logo_url TEXT,
  hq_country TEXT CHECK (hq_country IS NULL OR (LENGTH(hq_country) = 3 AND hq_country = UPPER(hq_country))),
  hq_city TEXT,
  summary TEXT,
  employees TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

