-- AlterTable
ALTER TABLE "user_profile" ADD COLUMN     "contactVisibility" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "personalVisibility" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "preferenceVisibility" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "skillsVisibility" BOOLEAN NOT NULL DEFAULT true;
