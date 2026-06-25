-- AlterTable
ALTER TABLE "Parent" ADD COLUMN     "notifyEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "weeklyReportEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "autoApproveTasks" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "payoutMethod" TEXT NOT NULL DEFAULT 'card';
