/*
  Warnings:

  - Made the column `newId` on table `Wellbeing` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Wellbeing" ALTER COLUMN "newId" SET NOT NULL;
