/*
  Warnings:

  - You are about to drop the column `department_id` on the `Employee_Under_Batch` table. All the data in the column will be lost.
  - Made the column `newDepartmentId` on table `Employee_Under_Batch` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Employee_Under_Batch" DROP COLUMN "department_id",
ALTER COLUMN "newDepartmentId" SET NOT NULL;
