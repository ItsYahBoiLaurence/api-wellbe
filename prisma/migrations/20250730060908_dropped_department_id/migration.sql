/*
  Warnings:

  - You are about to drop the column `id` on the `Department` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Department_id_key";

-- AlterTable
ALTER TABLE "Department" DROP COLUMN "id";
