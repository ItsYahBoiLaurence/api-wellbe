/*
  Warnings:

  - The primary key for the `UserAdvice` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "UserAdvice" DROP CONSTRAINT "UserAdvice_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ADD CONSTRAINT "UserAdvice_pkey" PRIMARY KEY ("newId");
DROP SEQUENCE "UserAdvice_id_seq";
