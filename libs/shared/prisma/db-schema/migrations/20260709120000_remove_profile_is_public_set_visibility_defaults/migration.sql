-- AlterTable
ALTER TABLE "user_profile"
DROP COLUMN "isPublic",
ALTER COLUMN "personalVisibility"
SET DEFAULT 0,
ALTER COLUMN "contactVisibility"
SET DEFAULT 0,
ALTER COLUMN "skillsVisibility"
SET DEFAULT 0,
ALTER COLUMN "preferenceVisibility"
SET DEFAULT 0;