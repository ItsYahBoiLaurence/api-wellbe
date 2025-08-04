/*
  Warnings:

  - Made the column `newId` on table `Employee` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Employee" ALTER COLUMN "newId" SET NOT NULL;
