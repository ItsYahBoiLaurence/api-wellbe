/*
  Warnings:

  - Made the column `newId` on table `Inbox` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Inbox" ALTER COLUMN "newId" SET NOT NULL;
