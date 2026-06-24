-- Add auth credentials to Parent and Child.
--
-- These columns are NOT NULL, so to stay safe against an already-populated
-- database (e.g. the seeded demo families) we add each column with a temporary
-- default, backfill existing rows, then drop the default. Legacy rows get an
-- empty passwordHash (never a valid bcrypt hash, so login is impossible until
-- the password is reset / the row is re-seeded) and a deterministic, unique
-- username derived from the primary key.

-- Parent.passwordHash
ALTER TABLE "Parent" ADD COLUMN "passwordHash" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Parent" ALTER COLUMN "passwordHash" DROP DEFAULT;

-- Child.passwordHash + Child.username
ALTER TABLE "Child" ADD COLUMN "passwordHash" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Child" ADD COLUMN "username" TEXT NOT NULL DEFAULT '';
UPDATE "Child" SET "username" = 'legacy_' || "id" WHERE "username" = '';
ALTER TABLE "Child" ALTER COLUMN "passwordHash" DROP DEFAULT;
ALTER TABLE "Child" ALTER COLUMN "username" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "Child_username_key" ON "Child"("username");
