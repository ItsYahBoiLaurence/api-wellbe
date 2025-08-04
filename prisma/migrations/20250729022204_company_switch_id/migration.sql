/*
  Warnings:

  - The primary key for the `Company` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Company" DROP CONSTRAINT "Company_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ADD CONSTRAINT "Company_pkey" PRIMARY KEY ("newId");
DROP SEQUENCE "Company_id_seq";
