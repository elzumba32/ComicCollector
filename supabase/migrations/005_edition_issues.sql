CREATE TABLE edition_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id UUID REFERENCES editions(id) ON DELETE CASCADE,
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(edition_id, issue_id)
);

ALTER TABLE edition_issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view edition_issues" 
  ON edition_issues FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert edition_issues" 
  ON edition_issues FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete edition_issues" 
  ON edition_issues FOR DELETE 
  USING (auth.role() = 'authenticated');
