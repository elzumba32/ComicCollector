CREATE TABLE sagas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  start_year INTEGER,
  end_year INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sagas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sagas" 
  ON sagas FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert sagas" 
  ON sagas FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update sagas" 
  ON sagas FOR UPDATE 
  USING (auth.role() = 'authenticated');
