-- Additive workflow metadata; existing approval status and private access remain.
alter table public.panels
 add column if not exists review_note text,
 add column if not exists needs_information boolean not null default false,
 add column if not exists received_at timestamptz,
 add column if not exists expo_selected boolean not null default false;
