-- Temporarily disable foreign keys to prevent cascade deletion
PRAGMA foreign_keys = OFF;

-- Drop the old companies table
DROP TABLE companies;

-- Re-enable foreign keys
PRAGMA foreign_keys = ON;

