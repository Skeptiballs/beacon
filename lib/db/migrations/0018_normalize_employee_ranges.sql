-- Normalize employee ranges into fixed buckets
WITH cleaned AS (
  SELECT
    id,
    TRIM(REPLACE(REPLACE(REPLACE(employees, '–', '-'), ' ', ''), ',', '')) AS cleaned,
    INSTR(TRIM(REPLACE(REPLACE(REPLACE(employees, '–', '-'), ' ', ''), ',', '')), '-') AS dash_pos,
    INSTR(TRIM(REPLACE(REPLACE(REPLACE(employees, '–', '-'), ' ', ''), ',', '')), '+') AS plus_pos
  FROM companies
  WHERE employees IS NOT NULL AND employees != ''
),
parsed AS (
  SELECT
    id,
    cleaned,
    dash_pos,
    plus_pos,
    CASE
      WHEN dash_pos > 0 THEN
        (CAST(SUBSTR(cleaned, 1, dash_pos - 1) AS INTEGER) + CAST(SUBSTR(cleaned, dash_pos + 1) AS INTEGER)) / 2.0
      WHEN plus_pos > 0 THEN CAST(SUBSTR(cleaned, 1, plus_pos - 1) AS INTEGER) + 1
      WHEN cleaned GLOB '*[^0-9]*' THEN NULL
      ELSE CAST(cleaned AS INTEGER)
    END AS sample_value
  FROM cleaned
)
UPDATE companies
SET employees = (
  SELECT CASE
    WHEN sample_value BETWEEN 1 AND 10 THEN '1-10'
    WHEN sample_value BETWEEN 11 AND 50 THEN '11-50'
    WHEN sample_value BETWEEN 51 AND 200 THEN '51-200'
    WHEN sample_value BETWEEN 201 AND 500 THEN '201-500'
    WHEN sample_value BETWEEN 501 AND 1000 THEN '501-1000'
    WHEN sample_value BETWEEN 1001 AND 5000 THEN '1001-5000'
    WHEN sample_value BETWEEN 5001 AND 10000 THEN '5001-10000'
    WHEN sample_value >= 10001 THEN '10001+'
    ELSE NULL
  END
  FROM parsed
  WHERE parsed.id = companies.id
)
WHERE id IN (SELECT id FROM parsed);




