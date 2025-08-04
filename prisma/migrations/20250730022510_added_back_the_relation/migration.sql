-- AlterTable
ALTER TABLE "Answer" ADD COLUMN     "new_employee_id" TEXT;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_new_employee_id_fkey" FOREIGN KEY ("new_employee_id") REFERENCES "Employee_Under_Batch"("newId") ON DELETE CASCADE ON UPDATE CASCADE;
