/*
  Warnings:

  - You are about to drop the column `employee_id` on the `Answer` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_employee_id_fkey";

-- AlterTable
ALTER TABLE "Answer" DROP COLUMN "employee_id";
