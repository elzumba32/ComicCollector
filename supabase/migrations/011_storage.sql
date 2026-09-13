INSERT INTO storage.buckets (id, name, public)
VALUES ('covers', 'covers', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view covers"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'covers');

CREATE POLICY "Authenticated users can upload covers"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'covers' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update covers"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'covers' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete covers"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'covers' AND auth.role() = 'authenticated');
