-- Vyn räknar statistik per spelare baserat på matches + sets
-- Best practice: härledd data via vy (inte sparad duplicerat)

create or replace view public.player_stats_v
with (security_invoker = on)  -- gör att vy:n respekterar anroparens RLS
as
with set_rows as (
  -- "Roterar" varje set till två rader: en per spelare
  select
    s.match_id,
    m.player1_id as player_id,
    s.player1_score as score_for,
    s.player2_score as score_against
  from sets s
  join matches m on m.id = s.match_id

  union all

  select
    s.match_id,
    m.player2_id as player_id,
    s.player2_score as score_for,
    s.player1_score as points_against
  from sets s
  join matches m on m.id = s.match_id
),
per_match_player as (
  -- Aggregerar per (match, spelare)
  select
    match_id,
    player_id,
    sum(score_for)                           as points_for,
    sum(score_against)                       as points_against,
    sum(case when score_for > score_against then 1 else 0 end) as sets_won,
    sum(case when score_for < score_against then 1 else 0 end) as sets_lost
  from set_rows
  group by match_id, player_id
),
match_results as (
  -- Bestämmer om spelaren vann matchen (fler set än motståndaren)
  select
    a.match_id,
    a.player_id,
    case
      when a.sets_won > b.sets_won then 1
      when a.sets_won < b.sets_won then 0
      else null  -- oavgjort/ej komplett; hanteras med COALESCE senare
    end as match_won
  from per_match_player a
  join per_match_player b
    on a.match_id = b.match_id
   and a.player_id <> b.player_id
),
per_player as (
  -- Summerar per spelare över alla matcher
  select
    p.id as player_id,
    p.name,
    count(distinct pm.match_id)                               as matches_played,
    coalesce(sum(mr.match_won), 0)                            as matches_won,
    count(distinct pm.match_id) - coalesce(sum(mr.match_won),0) as matches_lost,
    coalesce(sum(pm.points_for), 0)                           as points_for,
    coalesce(sum(pm.points_against), 0)                       as points_against,
    coalesce(sum(pm.sets_won), 0)                             as sets_won,
    coalesce(sum(pm.sets_lost), 0)                            as sets_lost
  from players p
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
  (points_for - points_against) as points_diff,  -- +/- poäng
  sets_won,
  sets_lost,
  (sets_won - sets_lost)       as sets_diff      -- +/- set
from per_player
order by points_diff desc, matches_won desc, name asc;
