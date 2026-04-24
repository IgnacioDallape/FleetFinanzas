create table if not exists public.user_app_state (
  user_id uuid not null,
  app_name text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, app_name)
);

create or replace function public.touch_user_app_state_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_touch_user_app_state_updated_at on public.user_app_state;
create trigger trg_touch_user_app_state_updated_at
before update on public.user_app_state
for each row
execute function public.touch_user_app_state_updated_at();

alter table public.user_app_state enable row level security;
revoke all on public.user_app_state from anon, authenticated;

create or replace function public.get_user_app_state(p_user_id uuid, p_app_name text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payload jsonb;
begin
  select payload
    into v_payload
    from public.user_app_state
   where user_id = p_user_id
     and app_name = p_app_name;

  return v_payload;
end;
$$;

create or replace function public.upsert_user_app_state(p_user_id uuid, p_app_name text, p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_app_state (user_id, app_name, payload)
  values (p_user_id, p_app_name, coalesce(p_payload, '{}'::jsonb))
  on conflict (user_id, app_name)
  do update
     set payload = excluded.payload,
         updated_at = timezone('utc', now());

  return p_payload;
end;
$$;

create or replace function public.delete_user_app_state(p_user_id uuid, p_app_name text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.user_app_state
   where user_id = p_user_id
     and app_name = p_app_name;

  return true;
end;
$$;

grant execute on function public.get_user_app_state(uuid, text) to anon, authenticated;
grant execute on function public.upsert_user_app_state(uuid, text, jsonb) to anon, authenticated;
grant execute on function public.delete_user_app_state(uuid, text) to anon, authenticated;
