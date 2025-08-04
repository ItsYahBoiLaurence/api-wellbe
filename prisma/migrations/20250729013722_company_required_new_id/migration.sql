/*
  Warnings:

  - Made the column `newId` on table `Company` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Company" ALTER COLUMN "newId" SET NOT NULL;
