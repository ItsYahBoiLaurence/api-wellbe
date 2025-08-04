/*
  Warnings:

  - Made the column `newId` on table `Batch_Record` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Batch_Record" ALTER COLUMN "newId" SET NOT NULL;
