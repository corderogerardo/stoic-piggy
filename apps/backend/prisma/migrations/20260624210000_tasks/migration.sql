-- CreateEnum
CREATE TYPE "TaskCategory" AS ENUM ('chore', 'lesson');

-- CreateEnum
CREATE TYPE "TaskPayType" AS ENUM ('money', 'xp', 'both');

-- CreateEnum
CREATE TYPE "TaskRecurrence" AS ENUM ('once', 'daily', 'weekly');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('active', 'submitted', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "TaskCategory" NOT NULL DEFAULT 'chore',
    "payType" "TaskPayType" NOT NULL DEFAULT 'money',
    "amountCents" INTEGER NOT NULL DEFAULT 0,
    "rewardXp" INTEGER NOT NULL DEFAULT 0,
    "recurrence" "TaskRecurrence" NOT NULL DEFAULT 'once',
    "status" "TaskStatus" NOT NULL DEFAULT 'active',
    "note" TEXT,
    "submittedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Task_childId_idx" ON "Task"("childId");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;
