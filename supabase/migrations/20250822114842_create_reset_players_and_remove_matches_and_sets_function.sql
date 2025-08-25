-- Nollställ pingisdata - alla spelares statistik och tar bort matcher och sets
-- Best practice: SECURITY DEFINER, transaktion, defensiva exists-kontroller.

create or replace function public.reset_pingis_data()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- 1) Töm sets + matches helt (snabbt, FK-säkert) och återställ ID-sekvenser
  truncate table public.sets, public.matches
    restart identity cascade;

  -- 2) Nollställ all spelarstatistik enligt ditt schema
  update public.players
     set wins                = 0,
         losses              = 0,
         total_score         = 0,
         total_score_against = 0,
         sets_won            = 0,
         sets_lost           = 0,
         sets_played         = 0,
         deleted_at          = null;

  -- 3) (om du har snapshots) töm dem
  if to_regclass('public.player_stats_snapshot') is not null then
    execute 'truncate table public.player_stats_snapshot';
  end if;

  -- 4) (om du har MV) refresha den – OBS: inte CONCURRENTLY i en funktion
  if to_regclass('public.player_stats_mv') is not null then
    execute 'refresh materialized view public.player_stats_mv';
  end if;
end;
$$;

revoke all on function public.reset_pingis_data() from public;
grant execute on function public.reset_pingis_data() to anon, authenticated;

