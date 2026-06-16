-- Council-for-Slack — decisions table + SECURITY DEFINER RPCs
--
-- Cohabits with VibeXForge in the same Supabase project (free-tier 2-project
-- limit forced this; schema isolation is the canonical Postgres pattern anyway).
--
-- Architecture:
--   - All council-for-slack tables live in the `council` schema. VibeXForge owns `public`.
--   - The Slack bot uses Supabase's existing anon key (no new secret to manage).
--   - All writes/reads go through SECURITY DEFINER RPCs in `public` (so anon can call them
--     without grant on the council schema). The RPCs validate input + write to council.
--   - This mirrors VibeXForge's own pattern (increment_play, toggle_upvote, etc.).
--
-- Idempotent: re-running this migration is safe.

create schema if not exists council;

create extension if not exists "pgcrypto";

create table if not exists council.decisions (
  id                    uuid primary key default gen_random_uuid(),
  slack_workspace_id    text not null,
  slack_user_id         text not null,
  slack_channel_id      text not null,
  question              text not null,
  domain                text not null default 'founder',
  voices                jsonb not null,
  consensus             text not null,
  recommendation        text not null check (recommendation in ('go','wait','kill','split')),
  agreement_score       numeric not null check (agreement_score >= 0 and agreement_score <= 1),
  oracle                jsonb,
  created_at            timestamptz not null default now(),
  resolved_at           timestamptz,
  outcome               text check (outcome is null or outcome in ('happened','did_not_happen')),
  brier_council         numeric,
  brier_voices          jsonb
);

create index if not exists decisions_workspace_created_idx
  on council.decisions (slack_workspace_id, created_at desc);

create index if not exists decisions_resolved_idx
  on council.decisions (resolved_at) where resolved_at is not null;

-- Defense-in-depth: deny direct table access to anon/authenticated.
-- SECURITY DEFINER RPCs are the only path in.
alter table council.decisions enable row level security;

drop policy if exists decisions_deny_anon on council.decisions;
create policy decisions_deny_anon on council.decisions
  for all to anon using (false) with check (false);

drop policy if exists decisions_deny_authenticated on council.decisions;
create policy decisions_deny_authenticated on council.decisions
  for all to authenticated using (false) with check (false);


-- ─────────────────────────────────────────────────────────────
-- RPC 1: insert a new decision (called by /council Slack handler)
-- ─────────────────────────────────────────────────────────────
create or replace function public.council_decision_insert(
  p_workspace_id      text,
  p_user_id           text,
  p_channel_id        text,
  p_question          text,
  p_domain            text,
  p_voices            jsonb,
  p_consensus         text,
  p_recommendation    text,
  p_agreement_score   numeric,
  p_oracle            jsonb
)
returns uuid
language plpgsql
security definer
set search_path = council, public, pg_temp
as $$
declare
  v_id uuid;
begin
  if p_workspace_id is null or length(p_workspace_id) = 0 then
    raise exception 'workspace_id required';
  end if;
  if p_question is null or length(p_question) = 0 then
    raise exception 'question required';
  end if;
  if p_recommendation not in ('go','wait','kill','split') then
    raise exception 'invalid recommendation: %', p_recommendation;
  end if;
  if p_agreement_score < 0 or p_agreement_score > 1 then
    raise exception 'invalid agreement_score: %', p_agreement_score;
  end if;
  if jsonb_array_length(p_voices) > 50 then
    raise exception 'too many voices (max 50)';
  end if;

  insert into council.decisions (
    slack_workspace_id, slack_user_id, slack_channel_id,
    question, domain, voices, consensus,
    recommendation, agreement_score, oracle
  ) values (
    p_workspace_id, p_user_id, p_channel_id,
    p_question, coalesce(p_domain, 'founder'), p_voices, p_consensus,
    p_recommendation, p_agreement_score, p_oracle
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.council_decision_insert(
  text, text, text, text, text, jsonb, text, text, numeric, jsonb
) from public;
grant execute on function public.council_decision_insert(
  text, text, text, text, text, jsonb, text, text, numeric, jsonb
) to anon;


-- ─────────────────────────────────────────────────────────────
-- RPC 2: list recent decisions for a Slack workspace
-- ─────────────────────────────────────────────────────────────
create or replace function public.council_decisions_recent(
  p_workspace_id  text,
  p_limit         int default 10
)
returns table (
  id                uuid,
  question          text,
  domain            text,
  recommendation    text,
  agreement_score   numeric,
  consensus         text,
  created_at        timestamptz,
  resolved_at       timestamptz,
  outcome           text,
  brier_council     numeric
)
language sql
security definer
set search_path = council, public, pg_temp
as $$
  select id, question, domain, recommendation, agreement_score, consensus,
         created_at, resolved_at, outcome, brier_council
  from council.decisions
  where slack_workspace_id = p_workspace_id
  order by created_at desc
  limit greatest(1, least(coalesce(p_limit, 10), 50));
$$;

revoke all on function public.council_decisions_recent(text, int) from public;
grant execute on function public.council_decisions_recent(text, int) to anon;


comment on schema council is
  'Council-for-Slack tenant schema. Coexists with VibeXForge public schema in same Supabase project. Access only via public.council_* SECURITY DEFINER RPCs.';

comment on table council.decisions is
  'One row per /council slash command invocation. Brier audit fields filled later via /council-resolve (Day 5).';
