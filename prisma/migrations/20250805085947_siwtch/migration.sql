/*
  Warnings:

  - The primary key for the `ScatterData` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "ScatterData" DROP CONSTRAINT "ScatterData_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ADD CONSTRAINT "ScatterData_pkey" PRIMARY KEY ("newId");
DROP SEQUENCE "ScatterData_id_seq";
