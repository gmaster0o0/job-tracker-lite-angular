-- Restore user ownership columns required by guards/access-control.
-- This migration is resilient if columns/constraints already exist.

INSERT INTO
    "user" (
        "id",
        "name",
        "email",
        "updatedAt"
    )
VALUES (
        'system-user',
        'System',
        'system@example.com',
        now()
    )
ON CONFLICT ("email") DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'Job' AND column_name = 'userId'
  ) THEN
    ALTER TABLE "Job" ADD COLUMN "userId" text;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'Contact' AND column_name = 'userId'
  ) THEN
    ALTER TABLE "Contact" ADD COLUMN "userId" text;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'Note' AND column_name = 'userId'
  ) THEN
    ALTER TABLE "Note" ADD COLUMN "userId" text;
  END IF;
END $$;

UPDATE "Job" SET "userId" = 'system-user' WHERE "userId" IS NULL;

UPDATE "Contact" c
SET
    "userId" = j."userId"
FROM "Job" j
WHERE
    c."jobId" = j."id"
    AND c."userId" IS NULL;

UPDATE "Note" n
SET
    "userId" = j."userId"
FROM "Job" j
WHERE
    n."jobId" = j."id"
    AND n."userId" IS NULL;

UPDATE "Contact" SET "userId" = 'system-user' WHERE "userId" IS NULL;

UPDATE "Note" SET "userId" = 'system-user' WHERE "userId" IS NULL;

ALTER TABLE "Job" ALTER COLUMN "userId" SET NOT NULL;

ALTER TABLE "Contact" ALTER COLUMN "userId" SET NOT NULL;

ALTER TABLE "Note" ALTER COLUMN "userId" SET NOT NULL;

ALTER TABLE "Job" DROP CONSTRAINT IF EXISTS "Job_userId_fkey";

ALTER TABLE "Contact"
DROP CONSTRAINT IF EXISTS "Contact_userId_fkey";

ALTER TABLE "Note" DROP CONSTRAINT IF EXISTS "Note_userId_fkey";

ALTER TABLE "Job"
ADD CONSTRAINT "Job_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE;

ALTER TABLE "Contact"
ADD CONSTRAINT "Contact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE;

ALTER TABLE "Note"
ADD CONSTRAINT "Note_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS "Job_userId_idx" ON "Job" ("userId");

CREATE INDEX IF NOT EXISTS "Contact_userId_idx" ON "Contact" ("userId");

CREATE INDEX IF NOT EXISTS "Note_userId_idx" ON "Note" ("userId");