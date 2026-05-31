-- Remove userId and user relation from Job, Contact, Note
-- These were added prematurely and are not part of the MVP scope.

ALTER TABLE "Job" DROP COLUMN IF EXISTS "userId";

ALTER TABLE "Contact" DROP COLUMN IF EXISTS "userId";

ALTER TABLE "Note" DROP COLUMN IF EXISTS "userId";