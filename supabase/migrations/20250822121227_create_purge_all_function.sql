begin;

-- Ta bort ALLA spelare, matcher och set.
-- Returnerar hur många rader som fanns innan rensningen.
drop function if exists public.purge_pingis_all();

create function public.purge_pingis_all()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_players_before int := 0;
  v_matches_before int := 0;
  v_sets_before    int := 0;
begin
  -- Räkna hur mycket som fanns innan (bara för feedback i UI)
  select count(*) into v_players_before from public.players;
  select count(*) into v_matches_before from public.matches;
  select count(*) into v_sets_before    from public.sets;

  -- TRUNCATE allt relevant. CASCADE följer FK-kedjan.
  -- (uuid-tabeller har ingen sekvens, men RESTART IDENTITY skadar inte.)
  truncate table public.sets, public.matches, public.players
    restart identity cascade;

  -- (Om snapshot-tabell finns, töm även den för att undvika FK-häng)
  if to_regclass('public.player_stats_snapshot') is not null then
    execute 'truncate table public.player_stats_snapshot';
  end if;

  -- (Om materialiserad vy finns, refresha den)
  if to_regclass('public.player_stats_mv') is not null then
    execute 'refresh materialized view public.player_stats_mv';
  end if;

  return json_build_object(
    'players_deleted', v_players_before,
    'matches_deleted', v_matches_before,
    'sets_deleted',    v_sets_before
  );
end;
$$;

revoke all on function public.purge_pingis_all() from public;
grant execute on function public.purge_pingis_all() to anon, authenticated;

commit;
