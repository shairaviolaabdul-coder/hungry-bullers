-- Allow admins to read payment-proof objects — required for
-- createSignedUrl() to work, since Supabase Storage checks a SELECT policy
-- before it will mint a signed URL. Customers still cannot read this
-- bucket at all (no policy grants them SELECT).

create policy "payment_proofs_admin_read"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'payment-proofs'
  and public.is_admin()
);
