-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('SAVED', 'APPLIED', 'INTERVIEW', 'JOB_OFFERED');

-- CreateTable
CREATE TABLE "Job" (
    "id" SERIAL NOT NULL,
    "position" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'SAVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Job_link_key" ON "Job"("link");