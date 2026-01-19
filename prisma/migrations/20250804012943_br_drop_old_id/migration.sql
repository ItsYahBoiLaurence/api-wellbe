/*
  Warnings:

  - You are about to drop the column `id` on the `Batch_Record` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Batch_Record_id_key";

-- AlterTable
ALTER TABLE "Batch_Record" DROP COLUMN "id";
