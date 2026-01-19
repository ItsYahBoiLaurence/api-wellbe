/*
  Warnings:

  - Made the column `newId` on table `UserAdvice` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "UserAdvice" ALTER COLUMN "newId" SET NOT NULL;
