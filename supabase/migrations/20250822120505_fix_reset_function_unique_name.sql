begin;

-- ersätt tidigare variant
drop function if exists public.reset_pingis_data();

create function public.reset_pingis_data()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_matches_deleted int := 0;
  v_sets_deleted     int := 0;
  v_players_reset    int := 0;
begin
  -- räkna före rensning
  select count(*) into v_matches_deleted from public.matches;
  select count(*) into v_sets_deleted     from public.sets;

  -- töm sets + matches och återställ ev. sekvenser
  truncate table public.sets, public.matches
    restart identity cascade;

  -- ✅ nollställ ENDAST statistik för aktiva spelare (rör inte deleted_at)
  update public.players
     set wins                = 0,
         losses              = 0,
         total_score         = 0,
         total_score_against = 0,
         sets_won            = 0,
         sets_lost           = 0,
         sets_played         = 0
   where deleted_at is null;

  get diagnostics v_players_reset = row_count;

  -- (om finns) töm snapshots
  if to_regclass('public.player_stats_snapshot') is not null then
    execute 'truncate table public.player_stats_snapshot';
  end if;

  -- (om finns) refresha materialiserad vy (ej CONCURRENTLY i funktion)
  if to_regclass('public.player_stats_mv') is not null then
    execute 'refresh materialized view public.player_stats_mv';
  end if;

  return json_build_object(
    'matches_deleted', v_matches_deleted,
    'sets_deleted',     v_sets_deleted,
    'players_reset',    v_players_reset
  );
end;
$$;

revoke all on function public.reset_pingis_data() from public;
grant execute on function public.reset_pingis_data() to anon, authenticated;

commit;
