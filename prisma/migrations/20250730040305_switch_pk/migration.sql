/*
  Warnings:

  - The primary key for the `Department` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[id]` on the table `Department` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Department_newId_key";

-- AlterTable
ALTER TABLE "Department" DROP CONSTRAINT "Department_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ADD CONSTRAINT "Department_pkey" PRIMARY KEY ("newId");
DROP SEQUENCE "Department_id_seq";

-- CreateIndex
CREATE UNIQUE INDEX "Department_id_key" ON "Department"("id");
