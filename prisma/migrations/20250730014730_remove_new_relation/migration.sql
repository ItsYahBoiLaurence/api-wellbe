/*
  Warnings:

  - You are about to drop the column `new_employee_id` on the `Answer` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_new_employee_id_fkey";

-- AlterTable
ALTER TABLE "Answer" DROP COLUMN "new_employee_id";
