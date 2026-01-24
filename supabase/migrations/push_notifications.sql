-- Create table for storing Expo Push Tokens
create table if not exists public.user_push_tokens (
  user_id uuid references auth.users(id) not null,
  token text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, token)
);

-- RLS for user_push_tokens
alter table public.user_push_tokens enable row level security;

create policy "Users can view their own tokens"
  on public.user_push_tokens for select
  using (auth.uid() = user_id);

create policy "Users can insert their own tokens"
  on public.user_push_tokens for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own tokens"
  on public.user_push_tokens for update
  using (auth.uid() = user_id);

create policy "Users can delete their own tokens"
  on public.user_push_tokens for delete
  using (auth.uid() = user_id);

-- Add user_id to business_members to link auth users to staff entries
alter table public.business_members 
add column if not exists user_id uuid references auth.users(id);

-- Policy to allow users to link themselves if email matches
create policy "Users can link themselves to invitations"
  on public.business_members for update
  using (
    -- Can update if the email matches their auth email
    email = (select email from auth.users where id = auth.uid())
    OR
    -- Or if they are the owner/admin (existing logic covers this usually, but let's be safe)
    exists (
      select 1 from public.business_members bm
      where bm.business_id = business_members.business_id
      and bm.user_id = auth.uid()
      and bm.role in ('owner', 'admin')
    )
  );

-- Allow reading user_id for members of the same business (so we can find who to notify)
create policy "Members can view other members user_ids"
  on public.business_members for select
  using (
    exists (
      select 1 from public.business_members bm
      where bm.business_id = business_members.business_id
      and bm.user_id = auth.uid()
    )
  );
