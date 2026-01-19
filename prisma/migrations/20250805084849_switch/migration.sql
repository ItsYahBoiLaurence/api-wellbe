/*
  Warnings:

  - The primary key for the `Tips` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Tips" DROP CONSTRAINT "Tips_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ADD CONSTRAINT "Tips_pkey" PRIMARY KEY ("newId");
DROP SEQUENCE "Tips_id_seq";
