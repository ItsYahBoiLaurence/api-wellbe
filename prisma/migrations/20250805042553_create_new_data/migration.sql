-- CreateEnum
CREATE TYPE "ScoreBand" AS ENUM ('HIGH', 'AVERAGE', 'BELOW_AVERAGE', 'LOW');

-- CreateEnum
CREATE TYPE "Domain" AS ENUM ('CHARACTER', 'CAREER', 'CONNECTEDNESS', 'CONTENTMENT');

-- CreateEnum
CREATE TYPE "DomainScoreband" AS ENUM ('VERY_HIGH', 'ABOVE_AVERAGE', 'AVERAGE', 'BELOW_AVERAGE', 'VERY_LOW');

-- CreateTable
CREATE TABLE "Interpretation" (
    "id" TEXT NOT NULL,
    "question_id" INTEGER NOT NULL,
    "score_band" "ScoreBand" NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "Interpretation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DomainInterpretation" (
    "id" TEXT NOT NULL,
    "domain" "Domain" NOT NULL,
    "score_band" "DomainScoreband" NOT NULL,
    "insight" TEXT NOT NULL,
    "what_to_build_on" TEXT NOT NULL,

    CONSTRAINT "DomainInterpretation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Answer_new_employee_id_idx" ON "Answer"("new_employee_id");

-- CreateIndex
CREATE INDEX "Employee_Under_Batch_newBatchId_idx" ON "Employee_Under_Batch"("newBatchId");

-- AddForeignKey
ALTER TABLE "Interpretation" ADD CONSTRAINT "Interpretation_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
