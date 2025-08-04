/*
  Warnings:

  - A unique constraint covering the columns `[newId]` on the table `Department` will be added. If there are existing duplicate values, this will fail.
  - Made the column `newId` on table `Department` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Department" ALTER COLUMN "newId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Department_newId_key" ON "Department"("newId");
