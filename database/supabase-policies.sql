-- Enable RLS
alter table plants enable row level security;
alter table users enable row level security;

-- Plants policies
create policy "Plants are viewable by everyone" on plants
	for select using (true);

create policy "Users can insert their own plants" on plants
	for insert with check (auth.uid() = user_id);

create policy "Users can update their own plants" on plants
	for update using (auth.uid() = user_id);

create policy "Users can delete their own plants" on plants
	for delete using (auth.uid() = user_id);

-- Users policies
create policy "Users can view their own profile" on users
	for select using (auth.uid() = id);

create policy "Users can update their own profile" on users
	for update using (auth.uid() = id);

create policy "Users can insert their own profile" on users
	for insert with check (auth.uid() = id);

-- Storage policies (run in storage schema)
-- Note: Create bucket 'plants' in Supabase first, set it public
-- Public read
create policy "Public read images" on storage.objects
	for select using (bucket_id = 'plants');

-- Authenticated upload
create policy "Authenticated upload" on storage.objects
	for insert with check (bucket_id = 'plants' and auth.role() = 'authenticated');

-- Update/delete own files (folder per user id)
create policy "Users update own" on storage.objects
	for update using (bucket_id = 'plants' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users delete own" on storage.objects
	for delete using (bucket_id = 'plants' and auth.uid()::text = (storage.foldername(name))[1]);
