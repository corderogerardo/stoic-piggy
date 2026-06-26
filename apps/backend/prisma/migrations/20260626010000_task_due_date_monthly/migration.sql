-- AlterEnum
ALTER TYPE "TaskRecurrence" ADD VALUE 'monthly';

-- AlterTable
ALTER TABLE "Task" ADD COLUMN "dueAt" TIMESTAMP(3);
