-- AlterTable
ALTER TABLE "Answer" ADD COLUMN     "employee_id" INTEGER;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee_Under_Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
