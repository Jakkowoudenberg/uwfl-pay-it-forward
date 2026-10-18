begin;
create table public.pattern_requests (
 id uuid primary key default gen_random_uuid(), request_id uuid not null unique,
 participant_number integer not null, pattern_id text check(pattern_id ~ '^P[0-9]{3}$'),
 title text not null check(length(title) between 1 and 160),
 motivation text not null check(length(motivation) between 1 and 3000),
 collaboration text not null check(length(collaboration) between 1 and 1000),
 status text not null default 'pending' check(status in ('pending','needs_info','approved','in_progress','completed','rejected','released')),
 review_note text check(length(review_note)<=2000),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index pattern_requests_maker on public.pattern_requests(participant_number,created_at);
create unique index pattern_requests_reserved on public.pattern_requests(pattern_id) where pattern_id is not null and status in ('approved','in_progress','completed');
alter table public.pattern_requests enable row level security;
revoke all on public.pattern_requests from public,anon,authenticated;
grant all on public.pattern_requests to service_role;
create table public.pattern_request_events(id uuid primary key default gen_random_uuid(),request_id uuid not null references public.pattern_requests(id),status text not null,note text,created_at timestamptz not null default now());
alter table public.pattern_request_events enable row level security;
revoke all on public.pattern_request_events from public,anon,authenticated;
grant all on public.pattern_request_events to service_role;
create function public.uwfl_pattern_submit(d jsonb) returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare r public.pattern_requests; n integer := (d->>'participant_number')::integer;
begin
 perform pg_advisory_xact_lock(8121,n);
 if not exists(select 1 from public.registrations where participant_number=n and status in ('pending','approved')) then return jsonb_build_object('error','credentials_mismatch'); end if;
 select * into r from public.pattern_requests where request_id=(d->>'request_id')::uuid;
 if found then
  if r.participant_number<>n then return jsonb_build_object('error','request_conflict'); end if;
  return jsonb_build_object('ok',true,'id',r.id,'status',r.status);
 end if;
 if (select count(*) from public.pattern_requests where participant_number=n and status in ('pending','needs_info','approved','in_progress'))>=2 then return jsonb_build_object('error','choice_limit'); end if;
 if d->>'pattern_id' is not null and exists(select 1 from public.pattern_requests where pattern_id=d->>'pattern_id' and status in ('approved','in_progress','completed')) then return jsonb_build_object('error','pattern_unavailable'); end if;
 if d->>'pattern_id' is not null and exists(select 1 from public.pattern_requests where participant_number=n and pattern_id=d->>'pattern_id' and status in ('pending','needs_info','approved','in_progress')) then return jsonb_build_object('error','duplicate_choice'); end if;
 insert into public.pattern_requests(request_id,participant_number,pattern_id,title,motivation,collaboration) values((d->>'request_id')::uuid,n,d->>'pattern_id',d->>'title',d->>'motivation',d->>'collaboration') returning * into r;
 insert into public.pattern_request_events(request_id,status) values(r.id,'pending');
 return jsonb_build_object('ok',true,'id',r.id,'status',r.status);
end $$;
create function public.uwfl_pattern_transition(d jsonb) returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare r public.pattern_requests; target text; actor text:=d->>'actor'; action text:=d->>'action'; n integer;
begin
 select participant_number into n from public.pattern_requests where id=(d->>'id')::uuid;
 if n is null then return jsonb_build_object('error','not_found'); end if;
 perform pg_advisory_xact_lock(8121,n);
 select * into r from public.pattern_requests where id=(d->>'id')::uuid for update;
 if d->>'expected_status' is distinct from r.status then return jsonb_build_object('error','already_reviewed'); end if;
 if actor='participant' then
  if (d->>'participant_number')::integer<>n then return jsonb_build_object('error','credentials_mismatch'); end if;
  if action='start' and r.status='approved' then target:='in_progress';
  elsif action='withdraw' and r.status in ('pending','needs_info','approved') then target:='released';
  elsif action='resubmit' and r.status='needs_info' then target:='pending';
  else return jsonb_build_object('error','invalid_transition'); end if;
 elsif actor='admin' then
  if action='approve' and r.status='pending' then
   if not exists(select 1 from public.registrations where participant_number=n and status='approved') then return jsonb_build_object('error','maker_pending'); end if;
   target:='approved';
  elsif action='request_information' and r.status='pending' and length(trim(d->>'note'))>0 then target:='needs_info';
  elsif action='reject' and r.status in ('pending','needs_info') then target:='rejected';
  elsif action='release' and r.status in ('approved','in_progress','completed') then target:='released';
  elsif action='start' and r.status='approved' then target:='in_progress';
  elsif action='complete' and r.status in ('approved','in_progress') then target:='completed';
  else return jsonb_build_object('error','invalid_transition'); end if;
 else return jsonb_build_object('error','invalid_actor'); end if;
 update public.pattern_requests set status=target,review_note=case when actor='admin' then nullif(d->>'note','') else review_note end,motivation=case when action='resubmit' then d->>'motivation' else motivation end,collaboration=case when action='resubmit' then d->>'collaboration' else collaboration end,updated_at=now() where id=r.id;
 insert into public.pattern_request_events(request_id,status,note) values(r.id,target,case when actor='admin' then nullif(d->>'note','') else null end);
 return jsonb_build_object('ok',true,'id',r.id,'status',target);
exception when unique_violation then return jsonb_build_object('error','pattern_unavailable');
end $$;
revoke all on function public.uwfl_pattern_submit(jsonb),public.uwfl_pattern_transition(jsonb) from public,anon,authenticated;
grant execute on function public.uwfl_pattern_submit(jsonb),public.uwfl_pattern_transition(jsonb) to service_role;
notify pgrst,'reload schema';
commit;
