/*
  Warnings:

  - The `isPublic` column on the `user_profile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `contactVisibility` column on the `user_profile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `personalVisibility` column on the `user_profile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `preferenceVisibility` column on the `user_profile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `skillsVisibility` column on the `user_profile` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "user_profile" DROP COLUMN "isPublic",
ADD COLUMN     "isPublic" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "contactVisibility",
ADD COLUMN     "contactVisibility" INTEGER NOT NULL DEFAULT 30,
DROP COLUMN "personalVisibility",
ADD COLUMN     "personalVisibility" INTEGER NOT NULL DEFAULT 30,
DROP COLUMN "preferenceVisibility",
ADD COLUMN     "preferenceVisibility" INTEGER NOT NULL DEFAULT 30,
DROP COLUMN "skillsVisibility",
ADD COLUMN     "skillsVisibility" INTEGER NOT NULL DEFAULT 30;
