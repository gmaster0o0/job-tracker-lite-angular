-- Backfill existing records with the system user (INSERT moved to next migration to ensure column exists)
-- Add userId column as nullable first (in case the previous migration was modified to be nullable or removed)
-- Using a check to see if the column exists might be safer if we are unsure about the state of 20260528010912_add_auth_models
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Contact' AND column_name='userId') THEN
        ALTER TABLE "Contact" ADD COLUMN "userId" text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Job' AND column_name='userId') THEN
        ALTER TABLE "Job" ADD COLUMN "userId" text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Note' AND column_name='userId') THEN
        ALTER TABLE "Note" ADD COLUMN "userId" text;
    END IF;
END $$;

-- Backfill existing records with the system user
UPDATE "Contact" SET "userId" = 'system-user' WHERE "userId" IS NULL;

UPDATE "Job" SET "userId" = 'system-user' WHERE "userId" IS NULL;

UPDATE "Note" SET "userId" = 'system-user' WHERE "userId" IS NULL;

-- Make the columns NOT NULL
ALTER TABLE "Contact" ALTER COLUMN "userId" SET NOT NULL;

ALTER TABLE "Job" ALTER COLUMN "userId" SET NOT NULL;

ALTER TABLE "Note" ALTER COLUMN "userId" SET NOT NULL;

-- Add foreign key constraints (using IF NOT EXISTS logic via DO block or just drop/re-add)
-- Dropping first ensures we can re-add them correctly if they half-exist
ALTER TABLE "Contact"
DROP CONSTRAINT IF EXISTS "Contact_userId_fkey";

ALTER TABLE "Contact"
ADD CONSTRAINT "Contact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE;

ALTER TABLE "Job" DROP CONSTRAINT IF EXISTS "Job_userId_fkey";

ALTER TABLE "Job"
ADD CONSTRAINT "Job_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE;

ALTER TABLE "Note" DROP CONSTRAINT IF EXISTS "Note_userId_fkey";

ALTER TABLE "Note"
ADD CONSTRAINT "Note_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE;