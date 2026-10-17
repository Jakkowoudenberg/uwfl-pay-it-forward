-- Additive server-only storage. Existing participant and artwork text stays intact.
create table if not exists public.artwork_dossiers (
 panel_id bigint primary key references public.panels(id) on delete cascade,
 participant_number integer not null,
 request_id uuid not null unique,
 details jsonb not null,
 created_at timestamptz not null default now()
);
alter table public.artwork_dossiers enable row level security;
revoke all on table public.artwork_dossiers from public,anon,authenticated;
grant select,insert,update,delete on table public.artwork_dossiers to service_role;
