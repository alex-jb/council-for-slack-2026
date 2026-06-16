-- Council-for-Slack Day 5 — context column + resolve RPC (Brier audit)
--
-- New:
--   1. context column on council.decisions (nullable) — captures the "after pipe"
--      portion of /council [decision] | [context] so personas get ground truth.
--   2. council_decision_resolve RPC — records actual outcome + computes Brier
--      scores for council recommendation and each voice.
--
-- Brier scoring math (binary outcome, calibration of probability forecasts):
--   - council recommendation → probability of "happened":
--       go → 0.80, wait → 0.40, kill → 0.10, split → 0.50
--   - per voice: score/100 used directly as probability of "happened"
--   - BS = (forecast - outcome)^2  ; outcome=1 happened, 0 did_not_happen
--   - Lower BS = better calibration. 0 = perfect, 0.25 = chance, 1 = catastrophically wrong.
--
-- Idempotent.

-- Drop old function signatures first — Postgres CREATE OR REPLACE cannot change
-- return type or parameter list, so we drop and recreate.
drop function if exists public.council_decision_insert(
  text, text, text, text, text, jsonb, text, text, numeric, jsonb
);
drop function if exists public.council_decisions_recent(text, int);

-- ─────────────────────────────────────────────────────────────
-- 1. context column
-- ─────────────────────────────────────────────────────────────
alter table council.decisions
  add column if not exists context text;


-- ─────────────────────────────────────────────────────────────
-- 2. updated insert RPC to accept context
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
  p_oracle            jsonb,
  p_context           text default null
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
    question, context, domain, voices, consensus,
    recommendation, agreement_score, oracle
  ) values (
    p_workspace_id, p_user_id, p_channel_id,
    p_question, p_context, coalesce(p_domain, 'founder'), p_voices, p_consensus,
    p_recommendation, p_agreement_score, p_oracle
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.council_decision_insert(
  text, text, text, text, text, jsonb, text, text, numeric, jsonb, text
) from public;
grant execute on function public.council_decision_insert(
  text, text, text, text, text, jsonb, text, text, numeric, jsonb, text
) to anon;


-- ─────────────────────────────────────────────────────────────
-- 3. updated recent RPC includes context
-- ─────────────────────────────────────────────────────────────
create or replace function public.council_decisions_recent(
  p_workspace_id  text,
  p_limit         int default 10
)
returns table (
  id                uuid,
  question          text,
  context           text,
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
  select id, question, context, domain, recommendation, agreement_score, consensus,
         created_at, resolved_at, outcome, brier_council
  from council.decisions
  where slack_workspace_id = p_workspace_id
  order by created_at desc
  limit greatest(1, least(coalesce(p_limit, 10), 50));
$$;

revoke all on function public.council_decisions_recent(text, int) from public;
grant execute on function public.council_decisions_recent(text, int) to anon;


-- ─────────────────────────────────────────────────────────────
-- 4. resolve RPC — records outcome + computes Brier
-- ─────────────────────────────────────────────────────────────
create or replace function public.council_decision_resolve(
  p_id            uuid,
  p_workspace_id  text,
  p_outcome       text
)
returns table (
  id                uuid,
  brier_council     numeric,
  brier_voices      jsonb
)
language plpgsql
security definer
set search_path = council, public, pg_temp
as $$
declare
  v_outcome_num     numeric;
  v_voices          jsonb;
  v_recommendation  text;
  v_p_council       numeric;
  v_brier_council   numeric;
  v_brier_voices    jsonb := '{}'::jsonb;
  voice             jsonb;
  voice_score       numeric;
begin
  if p_outcome not in ('happened','did_not_happen') then
    raise exception 'invalid outcome: %', p_outcome;
  end if;
  v_outcome_num := case when p_outcome = 'happened' then 1 else 0 end;

  -- Fetch decision; enforce workspace tenant isolation
  select recommendation, voices
    into v_recommendation, v_voices
    from council.decisions
   where council.decisions.id = p_id
     and slack_workspace_id = p_workspace_id
     and resolved_at is null;

  if not found then
    raise exception 'decision not found, wrong workspace, or already resolved';
  end if;

  -- Map council recommendation to probability of "happened"
  v_p_council := case v_recommendation
    when 'go'    then 0.80
    when 'wait'  then 0.40
    when 'kill'  then 0.10
    when 'split' then 0.50
  end;
  v_brier_council := power(v_p_council - v_outcome_num, 2);

  -- Per-voice Brier: voice.score / 100 as probability of "happened"
  for voice in select * from jsonb_array_elements(v_voices)
  loop
    voice_score := (voice->>'score')::numeric / 100;
    v_brier_voices := v_brier_voices || jsonb_build_object(
      voice->>'voice',
      round(power(voice_score - v_outcome_num, 2)::numeric, 4)
    );
  end loop;

  update council.decisions
     set resolved_at   = now(),
         outcome       = p_outcome,
         brier_council = round(v_brier_council::numeric, 4),
         brier_voices  = v_brier_voices
   where council.decisions.id = p_id;

  return query
    select p_id as id,
           round(v_brier_council::numeric, 4) as brier_council,
           v_brier_voices as brier_voices;
end;
$$;

revoke all on function public.council_decision_resolve(uuid, text, text) from public;
grant execute on function public.council_decision_resolve(uuid, text, text) to anon;


comment on function public.council_decision_resolve is
  'Records actual outcome (happened|did_not_happen) and computes Brier scores for council recommendation and each voice. One-shot — fails if decision already resolved.';
