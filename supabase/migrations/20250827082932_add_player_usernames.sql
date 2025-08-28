/* ===========================
   1) FÖRBEREDELSER + NYA KOLUMNER
   =========================== */
BEGIN;

-- Använd IF NOT EXISTS för idempotens
ALTER TABLE players
  ADD COLUMN IF NOT EXISTS "firstName" TEXT,
  ADD COLUMN IF NOT EXISTS "lastName"  TEXT,
  ADD COLUMN IF NOT EXISTS "username"  TEXT;

-- (Rekommenderat) Se till att unaccent finns för att normalisera ÅÄÖ m.fl.
-- I Supabase kan du skapa extension i publik schema.
CREATE EXTENSION IF NOT EXISTS unaccent;

-- 2) BACKFYLL: SPLITTA name -> firstName/lastName
-- Strategi: firstName = allt utom sista ordet, lastName = sista ordet
-- Hanterar 1+ ord; enkel, robust default för "Förnamn ... Efternamn".
UPDATE players
SET
  "firstName" = NULLIF(  -- om bara ett ord, blir tomt => NULL
    TRIM(
      REGEXP_REPLACE(name, '\s+[^[:space:]]+$', '')  -- ta bort sista token
    ), ''
  ),
  "lastName"  = NULLIF(
    TRIM(
      REGEXP_REPLACE(name, '^.*\s+', '')             -- behåll sista token
    ), ''
  )
WHERE name IS NOT NULL;

-- Om det bara fanns ett ord i name: sätt firstName = name där firstName är NULL och lastName NULL
UPDATE players
SET "firstName" = COALESCE("firstName", name)
WHERE name IS NOT NULL AND "firstName" IS NULL;

-- 3) GENERERA BAS-USERNAME FRÅN name
-- Normalisering:
--  - unaccent() tar bort diakritiska tecken (Å->A, Ö->O osv.)
--  - lower()
--  - ersätt icke [a-z0-9] med underscore
--  - trimma underscore i början/slutet
WITH base AS (
  SELECT
    id,
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        LOWER(unaccent(COALESCE(name, ''))),
        '[^a-z0-9]+', '_', 'g'
      ),
      '^_+|_+$', '', 'g'
    ) AS base_slug
  FROM players
)
UPDATE players p
SET "username" = CASE
  WHEN b.base_slug = '' THEN 'user_' || p.id::text  -- fallback om name var tomt/konstigt
  ELSE b.base_slug
END
FROM base b
WHERE p.id = b.id
  AND (p."username" IS NULL OR p."username" = '');

-- 4) SÄKERSTÄLL UNIKHET FÖR username GENOM SUFFIX VID DUBLETTER
-- Vi numrerar dubbletter per base och lägger _2, _3, ...
WITH dups AS (
  SELECT
    id,
    "username",
    ROW_NUMBER() OVER (PARTITION BY "username" ORDER BY id) AS rn
  FROM players
)
UPDATE players p
SET "username" = p."username" || '_' || d.rn
FROM dups d
WHERE p.id = d.id
  AND d.rn > 1;

-- 5) SÄTT name = "firstName lastName" (trimmat) enligt önskemål
UPDATE players
SET name = NULLIF(
  TRIM(
    COALESCE("firstName",'') || CASE WHEN "firstName" IS NOT NULL AND "lastName" IS NOT NULL THEN ' ' ELSE '' END || COALESCE("lastName",'')
  ),
  ''
)
WHERE "firstName" IS NOT NULL OR "lastName" IS NOT NULL;

COMMIT;



/* ===========================
   6) UNIKT INDEX + CONSTRAINT (UTANFÖR TRANSAKTION)
   =========================== */

-- Bygg index utan att låsa skrivningar
-- Namn på index är valfritt – välj ett konsekvent namnschema.
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_players_username_unique
  ON players ("username");

-- Knyt indexet till en formell UNIQUE-constraint (bra för tydliga felmeddelanden och verktygsstöd)
ALTER TABLE players
  ADD CONSTRAINT players_username_unique UNIQUE USING INDEX idx_players_username_unique
  -- Om constraint redan finns, ignorera
  -- (Tyvärr saknar ALTER TABLE ... IF NOT EXISTS för constraints i PostgreSQL;
  -- kör detta i idempotent migrationsramverk eller omge med DO-block vid behov)
;

-- 7) Sätt NOT NULL när vi vet att alla rader har värde
ALTER TABLE players
  ALTER COLUMN "username" SET NOT NULL;



/* ===========================
   8) TRIGGER FÖR ATT HÅLLA name I SYNK FRAMÅT
   =========================== */

-- Denna trigger bygger en "canonical" name från firstName/lastName på INSERT/UPDATE.
-- Notera: Att auto-generera unika usernames i trigger kan ge race conditions;
-- låt appen sätta username explicit eller fånga unique violation och retrya med suffix.
CREATE OR REPLACE FUNCTION players_sync_name_from_parts()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Om först/efter-namn ändras: regenerera name
  IF NEW."firstName" IS DISTINCT FROM OLD."firstName"
     OR NEW."lastName"  IS DISTINCT FROM OLD."lastName" THEN
    NEW.name :=
      NULLIF(
        TRIM(
          COALESCE(NEW."firstName",'') ||
          CASE WHEN NEW."firstName" IS NOT NULL AND NEW."lastName" IS NOT NULL THEN ' ' ELSE '' END ||
          COALESCE(NEW."lastName",'')
        ),
        ''
      );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_players_sync_name ON players;
CREATE TRIGGER trg_players_sync_name
BEFORE INSERT OR UPDATE OF "firstName", "lastName" ON players
FOR EACH ROW
EXECUTE FUNCTION players_sync_name_from_parts();
