-- Council-for-Slack Day 11 — workspace calibration meta-metric
--
-- New: council_workspace_stats RPC returns per-workspace aggregate calibration:
--   - total_decisions: count of /council fires this workspace has ever made
--   - resolved_decisions: count of decisions with outcome recorded
--   - avg_brier_council: arithmetic mean of brier_council over resolved decisions
--   - calibration_label: human-readable bucket ('excellent' / 'good' / 'fair' / 'needs-work' / 'pending')
--
-- The header of /council-audit shows this. Pitch: "your team is calibrated at
-- 0.14 over 23 resolved decisions" — single number teams compete on.
--
-- Brier calibration buckets:
--   - excellent   : avg BS < 0.10  (better than 90% confident perfect prediction would score 0.01)
--   - good        : avg BS < 0.20
--   - fair        : avg BS < 0.30  (around the 0.25 "always say 50%" chance baseline)
--   - needs-work  : avg BS >= 0.30
--   - pending     : no resolved decisions yet
--
-- Idempotent.

create or replace function public.council_workspace_stats(
  p_workspace_id  text
)
returns table (
  total_decisions       int,
  resolved_decisions    int,
  avg_brier_council     numeric,
  calibration_label     text
)
language sql
security definer
set search_path = council, public, pg_temp
as $$
  with rows as (
    select brier_council, resolved_at
    from council.decisions
    where slack_workspace_id = p_workspace_id
  ),
  agg as (
    select
      count(*)::int                                    as total_decisions,
      count(*) filter (where resolved_at is not null)::int as resolved_decisions,
      round(avg(brier_council) filter (where resolved_at is not null), 4) as avg_brier_council
    from rows
  )
  select
    total_decisions,
    resolved_decisions,
    avg_brier_council,
    case
      when resolved_decisions = 0 or avg_brier_council is null then 'pending'
      when avg_brier_council < 0.10 then 'excellent'
      when avg_brier_council < 0.20 then 'good'
      when avg_brier_council < 0.30 then 'fair'
      else 'needs-work'
    end as calibration_label
  from agg;
$$;

revoke all on function public.council_workspace_stats(text) from public;
grant execute on function public.council_workspace_stats(text) to anon;

comment on function public.council_workspace_stats is
  'Returns per-workspace aggregate calibration (total, resolved, avg Brier, label). Shown in /council-audit header so teams see their calibration drift over time.';
