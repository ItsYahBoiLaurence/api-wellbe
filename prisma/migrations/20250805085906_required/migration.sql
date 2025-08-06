/*
  Warnings:

  - Made the column `newId` on table `ScatterData` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ScatterData" ALTER COLUMN "newId" SET NOT NULL;
