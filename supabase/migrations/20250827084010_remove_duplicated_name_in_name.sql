BEGIN;
-- Tar bort dubbla namn i name t.ex. "Jan Jan" blir "Jan"
UPDATE players
SET name = REGEXP_REPLACE(name, '^(\S+)\s+\1$', '\1')
WHERE name ~ '^(\S+)\s+\1$';

COMMIT;