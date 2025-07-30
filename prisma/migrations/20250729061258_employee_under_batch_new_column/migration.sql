/*
  Warnings:

  - A unique constraint covering the columns `[newId]` on the table `Employee_Under_Batch` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Employee_Under_Batch" ADD COLUMN     "newId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Employee_Under_Batch_newId_key" ON "Employee_Under_Batch"("newId");
