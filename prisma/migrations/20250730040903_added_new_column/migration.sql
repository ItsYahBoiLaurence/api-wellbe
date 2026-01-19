-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "newDepartmentId" TEXT;

-- AlterTable
ALTER TABLE "Wellbeing" ADD COLUMN     "newDepartment" TEXT;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_newDepartmentId_fkey" FOREIGN KEY ("newDepartmentId") REFERENCES "Department"("newId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wellbeing" ADD CONSTRAINT "Wellbeing_department_fkey" FOREIGN KEY ("department") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;
