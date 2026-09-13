ALTER TABLE series ADD COLUMN IF NOT EXISTS external_cv_id TEXT;
ALTER TABLE issues ADD COLUMN IF NOT EXISTS external_cv_id TEXT;

CREATE INDEX IF NOT EXISTS idx_series_external_cv_id ON series(external_cv_id);
CREATE INDEX IF NOT EXISTS idx_issues_external_cv_id ON issues(external_cv_id);
