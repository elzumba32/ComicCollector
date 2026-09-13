CREATE TABLE publishers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE publishers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view publishers" 
  ON publishers FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert publishers" 
  ON publishers FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update publishers" 
  ON publishers FOR UPDATE 
  USING (auth.role() = 'authenticated');
