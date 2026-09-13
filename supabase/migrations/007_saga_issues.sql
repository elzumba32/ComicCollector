CREATE TABLE saga_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saga_id UUID REFERENCES sagas(id) ON DELETE CASCADE,
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  reading_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(saga_id, issue_id)
);

ALTER TABLE saga_issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view saga_issues" 
  ON saga_issues FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert saga_issues" 
  ON saga_issues FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete saga_issues" 
  ON saga_issues FOR DELETE 
  USING (auth.role() = 'authenticated');
