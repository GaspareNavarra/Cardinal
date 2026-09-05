-- Schema per la collezione di volumi di Cardinal.
-- Da eseguire manualmente nel SQL editor del progetto Supabase (Dashboard > SQL Editor).
-- Non esiste una cartella supabase/ collegata via CLI in questo repo: questo file
-- è solo un riferimento, va incollato ed eseguito a mano.

create table public.series (
  id uuid primary key default gen_random_uuid(),
  anilist_id integer unique not null,
  title text not null,
  image_url text,
  jp_volumes integer,
  italian_status text,
  italian_publisher text,
  created_at timestamptz default now()
);
alter table public.series enable row level security;
create policy "series readable by authenticated" on public.series
  for select to authenticated using (true);
create policy "series insertable by authenticated" on public.series
  for insert to authenticated with check (true);
create policy "series updatable by authenticated" on public.series
  for update to authenticated using (true) with check (true);

create table public.user_series (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  series_id uuid not null references public.series(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, series_id)
);
alter table public.user_series enable row level security;
create policy "own user_series" on public.user_series for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Una serie può avere più righe con lo stesso volume_number per lo stesso
-- user_series_id: è così che si rappresentano copie doppie/variant dello stesso
-- numero di volume (es. 2 copie del Vol.1), distinte via copy_label se serve.
create table public.volumes (
  id uuid primary key default gen_random_uuid(),
  user_series_id uuid not null references public.user_series(id) on delete cascade,
  volume_number integer,          -- null per edizioni speciali (Box, ecc.)
  special_label text,             -- es. 'Box'; null per volumi numerati normali
  copy_label text,                -- nota libera per distinguere copie doppie/variant
  status text not null default 'posseduto' check (status in ('posseduto','in_arrivo','letto')),
  created_at timestamptz default now()
);
alter table public.volumes enable row level security;
create policy "own volumes" on public.volumes for all to authenticated
  using (exists (
    select 1 from public.user_series us
    where us.id = volumes.user_series_id and us.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.user_series us
    where us.id = volumes.user_series_id and us.user_id = auth.uid()
  ));
