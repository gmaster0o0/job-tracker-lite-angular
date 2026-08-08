CREATE EXTENSION IF NOT EXISTS unaccent;

-- AlterTable: Add slug column (nullable at first)
ALTER TABLE "user" ADD COLUMN "slug" TEXT;

-- Names can collide or normalise to nothing, so duplicates get the row's id
-- appended - the whole id, not a prefix, since some ids share a leading
-- substring (e.g. "seed-user-recruiter" / "seed-user-moderator").
WITH normalised AS (
  SELECT
    "id",
    "createdAt",
    COALESCE(
      NULLIF(
        LOWER(
          REGEXP_REPLACE(
            BTRIM(
              REGEXP_REPLACE(unaccent("name"), '[^a-zA-Z0-9\s-]', '', 'g')
            ),
            '\s+', '-', 'g'
          )
        ),
        ''
      ),
      'user'
    ) AS base
  FROM "user"
),
numbered AS (
  SELECT
    "id",
    base,
    ROW_NUMBER() OVER (PARTITION BY base ORDER BY "createdAt", "id") AS rn
  FROM normalised
)
UPDATE "user" u
SET "slug" = CASE
  WHEN n.rn = 1 THEN n.base
  ELSE n.base || '-' || u."id"
END
FROM numbered n
WHERE n."id" = u."id";

-- Make slug required and unique
ALTER TABLE "user" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "user_slug_key" ON "user"("slug");
