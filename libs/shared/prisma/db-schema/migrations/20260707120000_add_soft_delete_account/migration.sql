-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'PENDING_DELETION');

-- AlterTable
ALTER TABLE "user"
ADD COLUMN "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN "gracePeriodRequestedAt" TIMESTAMP(3),
ADD COLUMN "scheduledDeletionAt" TIMESTAMP(3),
ADD COLUMN "gracePeriodDays" INTEGER NOT NULL DEFAULT 7;

-- CreateTable
CREATE TABLE "AccountDeletionToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AccountDeletionToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountDeletionToken_token_key" ON "AccountDeletionToken" ("token");

-- CreateIndex
CREATE INDEX "AccountDeletionToken_userId_idx" ON "AccountDeletionToken" ("userId");

-- AddForeignKey
ALTER TABLE "AccountDeletionToken"
ADD CONSTRAINT "AccountDeletionToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE;