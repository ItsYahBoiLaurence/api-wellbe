-- AddForeignKey
ALTER TABLE "UserAdvice" ADD CONSTRAINT "UserAdvice_newBatchCreated_fkey" FOREIGN KEY ("newBatchCreated") REFERENCES "Batch_Record"("newId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee_Under_Batch" ADD CONSTRAINT "Employee_Under_Batch_newBatchId_fkey" FOREIGN KEY ("newBatchId") REFERENCES "Batch_Record"("newId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wellbeing" ADD CONSTRAINT "Wellbeing_newBatchId_fkey" FOREIGN KEY ("newBatchId") REFERENCES "Batch_Record"("newId") ON DELETE CASCADE ON UPDATE CASCADE;
