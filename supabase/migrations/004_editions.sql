CREATE TABLE editions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  publisher_id UUID REFERENCES publishers(id) ON DELETE SET NULL,
  collection TEXT,
  country TEXT,
  isbn TEXT,
  publication_year INTEGER,
  purchase_date DATE,
  purchase_price DECIMAL(10,2),
  condition TEXT CHECK (condition IN ('mint','near_mint','very_good','good','fair','poor')),
  format TEXT CHECK (format IN ('tpb','omnibus','hardcover','softcover','absolute','other')),
  language TEXT DEFAULT 'es',
  cover_image_url TEXT,
  description TEXT,
  notes TEXT,
  physical_location TEXT,
  reading_status TEXT DEFAULT 'pending' CHECK (reading_status IN ('pending','reading','read')),
  personal_rating INTEGER CHECK (personal_rating BETWEEN 1 AND 5),
  external_url TEXT,
  data_source TEXT,
  data_source_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE editions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own editions" 
  ON editions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own editions" 
  ON editions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own editions" 
  ON editions FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own editions" 
  ON editions FOR DELETE 
  USING (auth.uid() = user_id);
