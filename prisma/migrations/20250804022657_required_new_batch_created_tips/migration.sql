/*
  Warnings:

  - Made the column `newBatchCreated` on table `Tips` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Tips" ALTER COLUMN "newBatchCreated" SET NOT NULL;
