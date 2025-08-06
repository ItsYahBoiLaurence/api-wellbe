/*
  Warnings:

  - The primary key for the `Wellbeing` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[id]` on the table `Wellbeing` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Wellbeing" DROP CONSTRAINT "Wellbeing_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ADD CONSTRAINT "Wellbeing_pkey" PRIMARY KEY ("newId");
DROP SEQUENCE "Wellbeing_id_seq";

-- CreateIndex
CREATE UNIQUE INDEX "Wellbeing_id_key" ON "Wellbeing"("id");
