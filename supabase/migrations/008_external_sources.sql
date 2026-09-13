CREATE TABLE external_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('series','issue','edition','publisher')),
  entity_id UUID NOT NULL,
  source_name TEXT NOT NULL,
  source_id TEXT,
  source_url TEXT,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE external_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view external_sources" 
  ON external_sources FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can manage external_sources" 
  ON external_sources FOR ALL 
  USING (auth.role() = 'authenticated');
