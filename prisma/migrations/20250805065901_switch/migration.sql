/*
  Warnings:

  - The primary key for the `Inbox` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[id]` on the table `Inbox` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Inbox" DROP CONSTRAINT "Inbox_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ADD CONSTRAINT "Inbox_pkey" PRIMARY KEY ("newId");
DROP SEQUENCE "Inbox_id_seq";

-- CreateIndex
CREATE UNIQUE INDEX "Inbox_id_key" ON "Inbox"("id");
