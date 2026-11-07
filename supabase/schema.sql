-- Run once in a new Supabase project's SQL Editor, then run npm run seed.
begin;
create table public.members (
 id uuid primary key references auth.users(id) on delete cascade,
 username text not null unique check (username in ('bf','gf'))
);
alter table public.members enable row level security;
create function public.is_member() returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.members where id = (select auth.uid()));
$$;
revoke all on function public.is_member() from public;
grant execute on function public.is_member() to authenticated;
create policy "members read membership" on public.members for select to authenticated using (public.is_member());

create table public.profiles (
 id uuid primary key references public.members(id) on delete cascade,
 username text not null unique check (username in ('bf','gf')),
 display_name text not null check (length(display_name) between 1 and 40),
 bio text not null default '' check (length(bio) <= 180)
);
create table public.notes (
 id uuid primary key default gen_random_uuid(),
 author_id uuid not null references public.members(id),
 title text not null check (length(title) between 1 and 100),
 body text not null check (length(body) between 1 and 10000),
 paper text not null default 'cream' check (paper in ('cream','pink','blue')),
 created_at timestamptz not null default now()
);
create table public.favorites (
 member_id uuid not null references public.members(id) on delete cascade,
 note_id uuid not null references public.notes(id) on delete cascade,
 primary key (member_id,note_id)
);
create table public.photos (
 id uuid primary key default gen_random_uuid(),
 uploader_id uuid not null references public.members(id),
 path text not null unique,
 caption text not null default '' check(length(caption)<=160),
 created_at timestamptz not null default now(),
 check (split_part(path,'/',1) = uploader_id::text)
);
alter table public.profiles enable row level security;
alter table public.notes enable row level security;
alter table public.favorites enable row level security;
alter table public.photos enable row level security;

-- Only the provisioning script can create members/profiles or alter identities.
revoke all on public.members, public.profiles, public.notes, public.favorites, public.photos from anon;
revoke all on public.members, public.profiles, public.notes, public.favorites, public.photos from authenticated;
grant select on public.members, public.profiles, public.notes, public.favorites, public.photos to authenticated;
grant update(display_name,bio) on public.profiles to authenticated;
grant insert,delete on public.notes to authenticated;
grant update(title,body,paper) on public.notes to authenticated;
grant insert,delete on public.favorites,public.photos to authenticated;

create policy "members read profiles" on public.profiles for select to authenticated using (public.is_member());
create policy "edit own profile" on public.profiles for update to authenticated using (id=(select auth.uid()) and public.is_member()) with check (id=(select auth.uid()) and public.is_member());
create policy "members read notes" on public.notes for select to authenticated using (public.is_member());
create policy "write own notes" on public.notes for insert to authenticated with check (author_id=(select auth.uid()) and public.is_member());
create policy "edit own notes" on public.notes for update to authenticated using (author_id=(select auth.uid()) and public.is_member()) with check (author_id=(select auth.uid()) and public.is_member());
create policy "delete own notes" on public.notes for delete to authenticated using (author_id=(select auth.uid()) and public.is_member());
create policy "read own favorites" on public.favorites for select to authenticated using (member_id=(select auth.uid()) and public.is_member());
create policy "add own favorites" on public.favorites for insert to authenticated with check (member_id=(select auth.uid()) and public.is_member());
create policy "remove own favorites" on public.favorites for delete to authenticated using (member_id=(select auth.uid()) and public.is_member());
create policy "members read photos" on public.photos for select to authenticated using (public.is_member());
create policy "add own photos" on public.photos for insert to authenticated with check (uploader_id=(select auth.uid()) and public.is_member());
create policy "delete own photos" on public.photos for delete to authenticated using (uploader_id=(select auth.uid()) and public.is_member());
create index notes_created_idx on public.notes(created_at desc);
create index photos_created_idx on public.photos(created_at desc);

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('memories','memories',false,5242880,array['image/jpeg','image/png','image/webp']);
create policy "members read private photos" on storage.objects for select to authenticated using(bucket_id='memories' and public.is_member());
create policy "members upload own photos" on storage.objects for insert to authenticated with check(bucket_id='memories' and public.is_member() and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "members remove own photos" on storage.objects for delete to authenticated using(bucket_id='memories' and public.is_member() and (storage.foldername(name))[1]=(select auth.uid())::text);
commit;
