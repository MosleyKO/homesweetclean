-- Create storage bucket for clean photos
insert into storage.buckets (id, name, public)
values ('clean-photos', 'clean-photos', true)
on conflict (id) do nothing;

-- Allow public reads
create policy "Public read clean photos"
  on storage.objects for select
  using (bucket_id = 'clean-photos');

-- Allow inserts (server-side uploads)
create policy "Allow upload clean photos"
  on storage.objects for insert
  with check (bucket_id = 'clean-photos');

-- Allow deletes
create policy "Allow delete clean photos"
  on storage.objects for delete
  using (bucket_id = 'clean-photos');
