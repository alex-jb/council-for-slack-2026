-- Council-for-Slack — OAuth multi-workspace install support
--
-- Stores per-workspace bot tokens so judges/users can install the app to
-- their own workspace via the install button in README. Replaces the
-- single SLACK_BOT_TOKEN env var (which still works as fallback for the
-- sandbox workspace).
--
-- Security:
--   - bot_tokens are SECRET. Reads go through SECURITY DEFINER RPC only.
--   - Anon key cannot read installations directly (RLS deny-all).
--   - The events.ts handler calls council_get_install_token(workspace_id)
--     which returns the token only for the requesting workspace.
--
-- Idempotent.

create table if not exists council.installations (
  workspace_id        text primary key,
  workspace_name      text,
  bot_token           text not null,
  bot_user_id         text,
  installed_by_user_id text,
  installed_at        timestamptz not null default now(),
  uninstalled_at      timestamptz,
  scopes              text
);

comment on table council.installations is
  'Per-workspace OAuth installations. bot_token is sensitive — read only via SECURITY DEFINER RPC.';

-- RLS: deny-all. The RPC is the only door.
alter table council.installations enable row level security;

drop policy if exists installations_deny_all on council.installations;
create policy installations_deny_all on council.installations for all using (false);

-- Insert / upsert RPC — called from /api/slack/oauth_redirect
create or replace function public.council_installation_upsert(
  p_workspace_id        text,
  p_workspace_name      text,
  p_bot_token           text,
  p_bot_user_id         text,
  p_installed_by_user_id text,
  p_scopes              text
)
returns uuid
language plpgsql
security definer
set search_path = council, public, pg_temp
as $$
declare
  dummy uuid := gen_random_uuid();
begin
  if p_workspace_id is null or length(p_workspace_id) = 0 then
    raise exception 'workspace_id required';
  end if;
  if p_bot_token is null or length(p_bot_token) < 20 then
    raise exception 'bot_token looks invalid';
  end if;

  insert into council.installations (
    workspace_id, workspace_name, bot_token, bot_user_id,
    installed_by_user_id, scopes, installed_at, uninstalled_at
  ) values (
    p_workspace_id, p_workspace_name, p_bot_token, p_bot_user_id,
    p_installed_by_user_id, p_scopes, now(), null
  )
  on conflict (workspace_id) do update set
    workspace_name      = excluded.workspace_name,
    bot_token           = excluded.bot_token,
    bot_user_id         = excluded.bot_user_id,
    installed_by_user_id = excluded.installed_by_user_id,
    scopes              = excluded.scopes,
    installed_at        = now(),
    uninstalled_at      = null;

  return dummy;  -- placeholder return; primary key is workspace_id text
end;
$$;

revoke all on function public.council_installation_upsert(text, text, text, text, text, text) from public;
grant execute on function public.council_installation_upsert(text, text, text, text, text, text) to anon;


-- Read token RPC — called from events.ts to resolve workspace → bot_token
-- Returns null if no installation (caller falls back to env var SLACK_BOT_TOKEN).
create or replace function public.council_get_install_token(
  p_workspace_id text
)
returns text
language sql
security definer
set search_path = council, public, pg_temp
as $$
  select bot_token
  from council.installations
  where workspace_id = p_workspace_id
    and uninstalled_at is null;
$$;

revoke all on function public.council_get_install_token(text) from public;
grant execute on function public.council_get_install_token(text) to anon;

comment on function public.council_get_install_token is
  'Resolves workspace_id to bot_token. Returns null if not installed → caller falls back to env-var sandbox token.';


-- Optional: uninstall RPC for when a workspace removes the app
create or replace function public.council_installation_uninstall(
  p_workspace_id text
)
returns void
language sql
security definer
set search_path = council, public, pg_temp
as $$
  update council.installations
  set uninstalled_at = now()
  where workspace_id = p_workspace_id;
$$;

revoke all on function public.council_installation_uninstall(text) from public;
grant execute on function public.council_installation_uninstall(text) to anon;
