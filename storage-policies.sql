-- ============================================================
-- Storage policies for the "media" bucket.
-- Run this once in Supabase SQL Editor, after creating the
-- "media" bucket (Storage → New Bucket → name it "media").
-- Without this, uploads from admin-media.html and the photo
-- uploads in Staff/Leadership/History/Clubs will fail with a
-- permissions error even though the bucket is set to Public.
-- ============================================================

create policy "public read media objects"
  on storage.objects for select
  using (bucket_id = 'media');

create policy "authenticated upload media objects"
  on storage.objects for insert
  with check (bucket_id = 'media' and auth.role() = 'authenticated');

create policy "authenticated update media objects"
  on storage.objects for update
  using (bucket_id = 'media' and auth.role() = 'authenticated');

create policy "authenticated delete media objects"
  on storage.objects for delete
  using (bucket_id = 'media' and auth.role() = 'authenticated');
