/*
  Warnings:

  - You are about to drop the column `id` on the `Inbox` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Inbox_id_key";

-- AlterTable
ALTER TABLE "Inbox" DROP COLUMN "id";
