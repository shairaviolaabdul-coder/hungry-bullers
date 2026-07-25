-- Private storage bucket for GCash payment proof screenshots.
--
-- - private (no public read)
-- - 5 MB max per file
-- - JPG/PNG/WEBP only (also re-validated in application code)
--
-- Policy model: customers (anon) may only INSERT new objects. There is no
-- SELECT, UPDATE, or DELETE policy for anon/authenticated, so nobody can
-- list, download, overwrite, or delete payment proofs from the browser —
-- including the person who just uploaded their own. Admin review happens
-- from a trusted server context using the service role key, which bypasses
-- storage RLS by design.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'payment-proofs',
  'payment-proofs',
  false,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "payment_proofs_anon_upload_only"
on storage.objects
for insert
to anon, authenticated
with check (
  bucket_id = 'payment-proofs'
  and (storage.foldername(name))[1] = 'proofs'
);
