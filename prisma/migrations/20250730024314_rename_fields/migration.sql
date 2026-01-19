/*
  Warnings:

  - Made the column `new_employee_id` on table `Answer` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Answer" ALTER COLUMN "new_employee_id" SET NOT NULL;
