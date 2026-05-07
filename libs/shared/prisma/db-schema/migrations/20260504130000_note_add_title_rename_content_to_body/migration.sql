-- Migration: note_add_title_rename_content_to_body
-- Adds title column and renames content to body on Note table

ALTER TABLE "Note" ADD COLUMN "title" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Note" ALTER COLUMN "title" DROP DEFAULT;
ALTER TABLE "Note" RENAME COLUMN "content" TO "body";
