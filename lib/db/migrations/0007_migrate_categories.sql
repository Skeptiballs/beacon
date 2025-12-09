INSERT INTO company_categories (company_id, category)
SELECT id, category FROM companies WHERE category IS NOT NULL;
