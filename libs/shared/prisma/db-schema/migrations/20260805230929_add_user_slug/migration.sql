-- Diacritic-aware slug backfill. Mirrors toSlug() in
-- libs/shared/core-utils/src/lib/utils/slug.util.ts: strip diacritics so
-- "Gábor Kotél" becomes "gabor-kotel", drop anything still not
-- alphanumeric/whitespace/hyphen, collapse whitespace runs into a hyphen.
CREATE EXTENSION IF NOT EXISTS unaccent;

-- AlterTable: Add slug column (nullable at first)
ALTER TABLE "user" ADD COLUMN "slug" TEXT;

-- Backfill. Names are not unique and some normalise to nothing at all (a name
-- written entirely in Cyrillic, CJK or punctuation), so the 'user' fallback
-- matches toUserSlugBase() and rows sharing a base are disambiguated by id.
-- Only the duplicates carry a suffix, so the common case keeps a clean slug -
-- the same shape AuthConfigFactory produces at runtime. Appending the whole id
-- rather than a prefix keeps this unique regardless of id format: seeded rows
-- use readable ids that share a leading substring ("seed-user-recruiter" and
-- "seed-user-moderator" agree for 8 characters).
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
