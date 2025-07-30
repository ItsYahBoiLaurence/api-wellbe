/*
  Warnings:

  - Made the column `idToRef` on table `Department` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Department" ALTER COLUMN "idToRef" SET NOT NULL;
