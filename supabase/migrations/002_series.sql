CREATE TABLE series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  publisher_id UUID REFERENCES publishers(id) ON DELETE SET NULL,
  year_began INTEGER,
  year_ended INTEGER,
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE series ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view series" 
  ON series FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert series" 
  ON series FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update series" 
  ON series FOR UPDATE 
  USING (auth.role() = 'authenticated');
