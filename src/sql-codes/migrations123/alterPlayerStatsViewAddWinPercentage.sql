-- Uppdatera vyn med vinstprocent i matcher (best practice)
drop view if exists public.player_stats_v cascade;

create or replace view public.player_stats_v
with (security_invoker = on)
as
with set_rows as (
  -- Rotera varje set till spelarrader
  select
    s.match_id,
    m.player1_id as player_id,
    s.p1_points as points_for,
    s.p2_points as points_against
  from public.sets s
  join public.matches m on m.id = s.match_id

  union all

  select
    s.match_id,
    m.player2_id as player_id,
    s.p2_points as points_for,
    s.p1_points as points_against
  from public.sets s
  join public.matches m on m.id = s.match_id
),
per_match_player as (
  select
    match_id,
    player_id,
    sum(points_for)                             as points_for,
    sum(points_against)                         as points_against,
    sum(case when points_for > points_against then 1 else 0 end) as sets_won,
    sum(case when points_for < points_against then 1 else 0 end) as sets_lost
  from set_rows
  group by match_id, player_id
),
match_results as (
  -- 1 = vinst, 0 = förlust, NULL = oavgjort/ej klart
  select
    a.match_id,
    a.player_id,
    case
      when a.sets_won > b.sets_won then 1
      when a.sets_won < b.sets_won then 0
      else null
    end as match_won
  from per_match_player a
  join per_match_player b
    on a.match_id = b.match_id
   and a.player_id <> b.player_id
),
per_player as (
  select
    p.id   as player_id,
    p.name as name,
    count(distinct pm.match_id)                                 as matches_played,
    coalesce(sum(mr.match_won), 0)                              as matches_won,
    count(distinct pm.match_id) - coalesce(sum(mr.match_won),0) as matches_lost,
    coalesce(sum(pm.points_for), 0)                             as points_for,
    coalesce(sum(pm.points_against), 0)                         as points_against,
    coalesce(sum(pm.sets_won), 0)                               as sets_won,
    coalesce(sum(pm.sets_lost), 0)                              as sets_lost
  from public.players p
  left join per_match_player pm on pm.player_id = p.id
  left join match_results mr
    on mr.match_id = pm.match_id and mr.player_id = p.id
  group by p.id, p.name
)
select
  player_id,
  name,
  matches_played,
  matches_won,
  matches_lost,
  points_for,
  points_against,
  (points_for - points_against) as points_diff,
  sets_won,
  sets_lost,
  (sets_won - sets_lost)        as sets_diff,
  -- Vinstprocent i matcher: korrekt numerisk division + skydd mot /0 + avrundning
  coalesce(
    round(
      (matches_won::numeric / nullif(matches_played, 0)::numeric) * 100
    , 2)
  , 0)::numeric(5,2)            as matches_win_pct
from per_player
order by points_diff desc, matches_won desc, name asc;

grant select on public.player_stats_v to anon, authenticated;
