/*
  Warnings:

  - The primary key for the `Employee_Under_Batch` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[id]` on the table `Employee_Under_Batch` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_employee_id_fkey";

-- DropIndex
DROP INDEX "Employee_Under_Batch_newId_key";

-- AlterTable
ALTER TABLE "Employee_Under_Batch" DROP CONSTRAINT "Employee_Under_Batch_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ADD CONSTRAINT "Employee_Under_Batch_pkey" PRIMARY KEY ("newId");
DROP SEQUENCE "Employee_Under_Batch_id_seq";

-- CreateIndex
CREATE UNIQUE INDEX "Employee_Under_Batch_id_key" ON "Employee_Under_Batch"("id");
