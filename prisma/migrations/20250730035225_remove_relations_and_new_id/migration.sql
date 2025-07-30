-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_department_id_fkey";

-- DropForeignKey
ALTER TABLE "Wellbeing" DROP CONSTRAINT "Wellbeing_department_fkey";

-- AlterTable
ALTER TABLE "Department" ADD COLUMN     "newId" TEXT;
