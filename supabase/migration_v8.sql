-- v8: fix catches DELETE policy + storage upload policies

-- Allow users to delete their own catches
CREATE POLICY "Users can delete own catches"
  ON catches FOR DELETE
  USING (auth.uid() = user_id);

-- Storage policies for catch-photos bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('catch-photos', 'catch-photos', true)
  ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public) VALUES ('spot-photos', 'spot-photos', true)
  ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
  ON CONFLICT (id) DO UPDATE SET public = true;

-- catch-photos: authenticated users can upload their own files
CREATE POLICY "Authenticated users can upload catch photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'catch-photos'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can update catch photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'catch-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view catch photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'catch-photos');

CREATE POLICY "Users can delete own catch photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'catch-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- spot-photos: authenticated users can upload
CREATE POLICY "Authenticated users can upload spot photos to storage"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'spot-photos'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Anyone can view spot photos from storage"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'spot-photos');

CREATE POLICY "Users can delete own spot photos from storage"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'spot-photos'
    AND auth.uid()::text = (storage.foldername(name))[2]
  );

-- avatars: authenticated users can manage their own
CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can update avatars"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');
