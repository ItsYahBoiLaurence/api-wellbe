-- CreateEnum
CREATE TYPE "Frequency" AS ENUM ('DAILY', 'WEEKLY', 'EVERY_HOUR', 'EVERY_MINUTE');

-- CreateTable
CREATE TABLE "Company" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "company_id" TEXT NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'employee',
    "department_id" INTEGER NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tips" (
    "id" SERIAL NOT NULL,
    "user" TEXT NOT NULL,
    "tip" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "batch_created" INTEGER NOT NULL,

    CONSTRAINT "Tips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAdvice" (
    "id" SERIAL NOT NULL,
    "user" TEXT NOT NULL,
    "advice" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "batch_created" INTEGER NOT NULL,

    CONSTRAINT "UserAdvice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "is_flipped" BOOLEAN NOT NULL,
    "domain" TEXT NOT NULL,
    "subdomain" TEXT NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Batch_Record" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3) NOT NULL,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "company_name" TEXT NOT NULL,
    "current_set_number" INTEGER NOT NULL DEFAULT 1,
    "frequency" "Frequency" NOT NULL,

    CONSTRAINT "Batch_Record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee_Under_Batch" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "question_bank" JSONB NOT NULL,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "batch_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "set_participation" JSONB NOT NULL DEFAULT '[false, false, false, false, false]',
    "department_id" INTEGER NOT NULL,

    CONSTRAINT "Employee_Under_Batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" SERIAL NOT NULL,
    "answer" JSONB NOT NULL,
    "employee_id" INTEGER NOT NULL,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "config_id" TEXT NOT NULL,
    "frequency" "Frequency" NOT NULL DEFAULT 'DAILY',

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("config_id")
);

-- CreateTable
CREATE TABLE "Advice" (
    "id" SERIAL NOT NULL,
    "sub_domain" TEXT NOT NULL,
    "low" TEXT NOT NULL,
    "below_average" TEXT NOT NULL,
    "average" TEXT NOT NULL,
    "above_average" TEXT NOT NULL,

    CONSTRAINT "Advice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wellbeing" (
    "id" SERIAL NOT NULL,
    "user_email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "wellbeing_score" JSONB NOT NULL,
    "batch_id" INTEGER NOT NULL,
    "department" INTEGER NOT NULL,

    CONSTRAINT "Wellbeing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScatterData" (
    "id" SERIAL NOT NULL,
    "company_name" TEXT NOT NULL,
    "scatterData" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScatterData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inbox" (
    "id" SERIAL NOT NULL,
    "subject" TEXT NOT NULL,
    "receiver" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "opened" BOOLEAN NOT NULL DEFAULT false,
    "tag" TEXT NOT NULL,

    CONSTRAINT "Inbox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_name_key" ON "Company"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_company_id_key" ON "Department"("name", "company_id");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserAdvice_user_batch_created_key" ON "UserAdvice"("user", "batch_created");

-- CreateIndex
CREATE UNIQUE INDEX "Questions_id_key" ON "Question"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_Under_Batch_email_batch_id_key" ON "Employee_Under_Batch"("email", "batch_id");

-- CreateIndex
CREATE UNIQUE INDEX "Wellbeing_user_email_batch_id_key" ON "Wellbeing"("user_email", "batch_id");

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tips" ADD CONSTRAINT "Tips_user_fkey" FOREIGN KEY ("user") REFERENCES "Employee"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAdvice" ADD CONSTRAINT "UserAdvice_user_fkey" FOREIGN KEY ("user") REFERENCES "Employee"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch_Record" ADD CONSTRAINT "Batch_Record_company_name_fkey" FOREIGN KEY ("company_name") REFERENCES "Company"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee_Under_Batch" ADD CONSTRAINT "Employee_Under_Batch_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "Batch_Record"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee_Under_Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settings" ADD CONSTRAINT "Settings_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "Company"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wellbeing" ADD CONSTRAINT "Wellbeing_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "Batch_Record"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wellbeing" ADD CONSTRAINT "Wellbeing_department_fkey" FOREIGN KEY ("department") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wellbeing" ADD CONSTRAINT "Wellbeing_user_email_fkey" FOREIGN KEY ("user_email") REFERENCES "Employee"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScatterData" ADD CONSTRAINT "ScatterData_company_name_fkey" FOREIGN KEY ("company_name") REFERENCES "Company"("name") ON DELETE CASCADE ON UPDATE CASCADE;
