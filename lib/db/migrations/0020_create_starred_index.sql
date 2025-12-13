-- Index to make starred filtering fast
CREATE INDEX IF NOT EXISTS idx_companies_starred ON companies (starred);




