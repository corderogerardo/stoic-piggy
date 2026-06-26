-- AlterTable: link a quest to its in-app lesson (cards + quiz)
ALTER TABLE "Quest" ADD COLUMN     "lessonKey" TEXT;
