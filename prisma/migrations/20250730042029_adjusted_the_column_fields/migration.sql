/*
  Warnings:

  - You are about to drop the column `department_id` on the `Employee` table. All the data in the column will be lost.
  - Made the column `newDepartmentId` on table `Employee` required. This step will fail if there are existing NULL values in that column.
  - Made the column `newDepartment` on table `Wellbeing` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Wellbeing" DROP CONSTRAINT "Wellbeing_department_fkey";

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "department_id",
ALTER COLUMN "newDepartmentId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Wellbeing" ALTER COLUMN "newDepartment" SET NOT NULL;
