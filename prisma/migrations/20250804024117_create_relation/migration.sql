-- AddForeignKey
ALTER TABLE "Tips" ADD CONSTRAINT "Tips_newBatchCreated_fkey" FOREIGN KEY ("newBatchCreated") REFERENCES "Batch_Record"("newId") ON DELETE CASCADE ON UPDATE CASCADE;
