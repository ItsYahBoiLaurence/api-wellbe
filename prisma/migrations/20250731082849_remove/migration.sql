/*
  Warnings:

  - Made the column `newBatchId` on table `Employee_Under_Batch` required. This step will fail if there are existing NULL values in that column.
  - Made the column `newBatchCreated` on table `UserAdvice` required. This step will fail if there are existing NULL values in that column.
  - Made the column `newBatchId` on table `Wellbeing` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Employee_Under_Batch" ALTER COLUMN "newBatchId" SET NOT NULL;

-- AlterTable
ALTER TABLE "UserAdvice" ALTER COLUMN "newBatchCreated" SET NOT NULL;

-- AlterTable
ALTER TABLE "Wellbeing" ALTER COLUMN "newBatchId" SET NOT NULL;
