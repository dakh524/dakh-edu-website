-- Create a new public bucket for website images (Events, Products, Advertisements)
insert into storage.buckets (id, name, public)
values ('website-images', 'website-images', true)
on conflict (id) do update set public = true;

-- Set up RLS policies for the website-images bucket
-- Allow public read access to the bucket
create policy "Public Access"
on storage.objects for select
to public
using ( bucket_id = 'website-images' );

-- Allow authenticated users to upload files to the bucket
create policy "Auth Upload Access"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'website-images' );

-- Allow authenticated users to update files in the bucket
create policy "Auth Update Access"
on storage.objects for update
to authenticated
with check ( bucket_id = 'website-images' );

-- Allow authenticated users to delete files from the bucket
create policy "Auth Delete Access"
on storage.objects for delete
to authenticated
using ( bucket_id = 'website-images' );
