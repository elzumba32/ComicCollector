CREATE TABLE issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID REFERENCES series(id) ON DELETE CASCADE,
  number TEXT NOT NULL,
  title TEXT,
  publication_date DATE,
  cover_image_url TEXT,
  gcd_id TEXT,
  cv_id TEXT,
  metron_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(series_id, number)
);

ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view issues" 
  ON issues FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert issues" 
  ON issues FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update issues" 
  ON issues FOR UPDATE 
  USING (auth.role() = 'authenticated');
