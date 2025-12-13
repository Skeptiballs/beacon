INSERT INTO companies_new (id, name, website, linkedin_url, logo_url, hq_country, hq_city, summary, employees, created_at, updated_at)
SELECT 
  id,
  name,
  website,
  linkedin_url,
  logo_url,
  CASE 
    WHEN hq_country IS NULL THEN NULL
    WHEN LENGTH(hq_country) = 3 THEN UPPER(hq_country)
    ELSE NULL
  END as hq_country,
  hq_city,
  summary,
  employees,
  created_at,
  updated_at
FROM companies;






