-- CreateEnum
CREATE TYPE "EmailChangeTokenType" AS ENUM ('VERIFY', 'RESTORE');

-- AlterTable
ALTER TABLE "user" ADD COLUMN "pendingEmail" TEXT;

-- CreateTable
CREATE TABLE "EmailChangeToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "type" "EmailChangeTokenType" NOT NULL,
    "oldEmail" TEXT NOT NULL,
    "newEmail" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "EmailChangeToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailChangeToken_token_key" ON "EmailChangeToken" ("token");

-- CreateIndex
CREATE INDEX "EmailChangeToken_userId_type_idx" ON "EmailChangeToken" ("userId", "type");

-- AddForeignKey
ALTER TABLE "EmailChangeToken"
ADD CONSTRAINT "EmailChangeToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE;