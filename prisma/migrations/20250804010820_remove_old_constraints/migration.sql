/*
  Warnings:

  - A unique constraint covering the columns `[email,newBatchId]` on the table `Employee_Under_Batch` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user,newBatchCreated]` on the table `UserAdvice` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_email,newBatchId]` on the table `Wellbeing` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Employee_Under_Batch_email_batch_id_newBatchId_key";

-- DropIndex
DROP INDEX "UserAdvice_user_batch_created_newBatchCreated_key";

-- DropIndex
DROP INDEX "Wellbeing_user_email_batch_id_newBatchId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Employee_Under_Batch_email_newBatchId_key" ON "Employee_Under_Batch"("email", "newBatchId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAdvice_user_newBatchCreated_key" ON "UserAdvice"("user", "newBatchCreated");

-- CreateIndex
CREATE UNIQUE INDEX "Wellbeing_user_email_newBatchId_key" ON "Wellbeing"("user_email", "newBatchId");
