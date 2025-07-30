-- AddForeignKey
ALTER TABLE "Wellbeing" ADD CONSTRAINT "Wellbeing_newDepartment_fkey" FOREIGN KEY ("newDepartment") REFERENCES "Department"("newId") ON DELETE CASCADE ON UPDATE CASCADE;
