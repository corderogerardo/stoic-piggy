-- CreateEnum
CREATE TYPE "GoalTerm" AS ENUM ('short', 'medium', 'long');

-- CreateEnum
CREATE TYPE "GoalCategory" AS ENUM ('thing', 'invest', 'learn');

-- AlterTable
ALTER TABLE "SavingsGoal" ADD COLUMN "term" "GoalTerm" NOT NULL DEFAULT 'short';
ALTER TABLE "SavingsGoal" ADD COLUMN "category" "GoalCategory" NOT NULL DEFAULT 'thing';
