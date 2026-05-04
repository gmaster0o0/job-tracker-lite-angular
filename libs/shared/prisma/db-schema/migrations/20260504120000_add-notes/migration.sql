-- Migration: add-notes
-- Creates the Note table and FK to Job (PostgreSQL)

CREATE TABLE IF NOT EXISTS "Note" (
  "id" SERIAL PRIMARY KEY,
  "content" TEXT NOT NULL,
  "jobId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP(3) NOT NULL
);

ALTER TABLE "Note"
  ADD CONSTRAINT "Note_jobId_fkey"
  FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE;

-- Indexes
CREATE INDEX IF NOT EXISTS "Note_jobId_idx" ON "Note" ("jobId");
