/*
  Warnings:

  - Made the column `newId` on table `Employee_Under_Batch` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Answer" ADD COLUMN     "new_employee_id" TEXT;

-- AlterTable
ALTER TABLE "Employee_Under_Batch" ALTER COLUMN "newId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_new_employee_id_fkey" FOREIGN KEY ("new_employee_id") REFERENCES "Employee_Under_Batch"("newId") ON DELETE CASCADE ON UPDATE CASCADE;
