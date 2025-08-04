/*
  Warnings:

  - The primary key for the `Batch_Record` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[id]` on the table `Batch_Record` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Batch_Record" DROP CONSTRAINT "Batch_Record_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ADD CONSTRAINT "Batch_Record_pkey" PRIMARY KEY ("newId");
DROP SEQUENCE "Batch_Record_id_seq";

-- CreateIndex
CREATE UNIQUE INDEX "Batch_Record_id_key" ON "Batch_Record"("id");
