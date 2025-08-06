/*
  Warnings:

  - Made the column `newId` on table `Tips` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Tips" ALTER COLUMN "newId" SET NOT NULL;
