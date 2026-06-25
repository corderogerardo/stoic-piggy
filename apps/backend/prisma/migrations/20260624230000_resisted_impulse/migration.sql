-- CreateTable
CREATE TABLE "ResistedImpulse" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL DEFAULT 0,
    "item" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResistedImpulse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ResistedImpulse_childId_idx" ON "ResistedImpulse"("childId");

-- AddForeignKey
ALTER TABLE "ResistedImpulse" ADD CONSTRAINT "ResistedImpulse_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;
