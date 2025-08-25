-- Lägg till Vinst % via en wrapper-view ovanpå befintlig player_stats_v
create or replace view public.player_stats_v2
with (security_invoker = on)
as
select
  pv.*,
  coalesce(
    round(
      (pv.matches_won::numeric / nullif(pv.matches_played, 0)::numeric) * 100
    , 2)
  , 0)::numeric(5,2) as matches_win_pct
from public.player_stats_v as pv;

grant select on public.player_stats_v2 to anon, authenticated;
