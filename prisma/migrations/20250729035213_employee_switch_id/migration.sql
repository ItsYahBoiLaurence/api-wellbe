/*
  Warnings:

  - The primary key for the `Employee` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ADD CONSTRAINT "Employee_pkey" PRIMARY KEY ("newId");
DROP SEQUENCE "Employee_id_seq";
