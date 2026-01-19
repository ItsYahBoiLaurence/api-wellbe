-- AddForeignKey
ALTER TABLE "UserAdvice" ADD CONSTRAINT "UserAdvice_batch_created_fkey" FOREIGN KEY ("batch_created") REFERENCES "Batch_Record"("id") ON DELETE CASCADE ON UPDATE CASCADE;
