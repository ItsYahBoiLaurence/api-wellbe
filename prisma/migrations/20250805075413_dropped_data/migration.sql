/*
  Warnings:

  - You are about to drop the column `id` on the `Wellbeing` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Wellbeing_id_key";

-- AlterTable
ALTER TABLE "Wellbeing" DROP COLUMN "id";
