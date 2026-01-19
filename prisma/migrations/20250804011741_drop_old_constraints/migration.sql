/*
  Warnings:

  - You are about to drop the column `batch_id` on the `Employee_Under_Batch` table. All the data in the column will be lost.
  - You are about to drop the column `batch_created` on the `UserAdvice` table. All the data in the column will be lost.
  - You are about to drop the column `batch_id` on the `Wellbeing` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Employee_Under_Batch" DROP COLUMN "batch_id";

-- AlterTable
ALTER TABLE "UserAdvice" DROP COLUMN "batch_created";

-- AlterTable
ALTER TABLE "Wellbeing" DROP COLUMN "batch_id";
