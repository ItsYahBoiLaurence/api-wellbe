/*
  Warnings:

  - You are about to drop the column `employee_id` on the `Answer` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Employee_Under_Batch` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Employee_Under_Batch_id_key";

-- AlterTable
ALTER TABLE "Answer" DROP COLUMN "employee_id";

-- AlterTable
ALTER TABLE "Employee_Under_Batch" DROP COLUMN "id";
