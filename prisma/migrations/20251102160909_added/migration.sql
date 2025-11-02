-- AlterTable
ALTER TABLE "Guest" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'guest';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'user';
