-- add_username_to_player_stats_v2.sql
create or replace view public.player_stats_v2
with (security_invoker = on)
as
select
  pv.*,
  -- matches_win_pct var redan med i v2 tidigare, behåll positionen
  coalesce(
    round( (pv.matches_won::numeric / nullif(pv.matches_played, 0)::numeric) * 100, 2 )
  , 0)::numeric(5,2) as matches_win_pct,
  p.username
from public.player_stats_v as pv
left join public.players p
  on p.id = pv.player_id;

grant select on public.player_stats_v2 to anon, authenticated;
