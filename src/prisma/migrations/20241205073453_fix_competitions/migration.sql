/*
  Warnings:

  - You are about to drop the column `submissionsId` on the `Judges` table. All the data in the column will be lost.
  - You are about to drop the `JudgeSubmission` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `winner_count` to the `Competitions` table without a default value. This is not possible if the table is not empty.
  - Made the column `competition_id` on table `Judges` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "JudgeSubmission" DROP CONSTRAINT "JudgeSubmission_judge_id_fkey";

-- DropForeignKey
ALTER TABLE "JudgeSubmission" DROP CONSTRAINT "JudgeSubmission_submission_id_fkey";

-- DropForeignKey
ALTER TABLE "Judges" DROP CONSTRAINT "Judges_submissionsId_fkey";

-- AlterTable
ALTER TABLE "Competitions" ADD COLUMN     "winner_count" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Judges" DROP COLUMN "submissionsId",
ADD COLUMN     "submissions_id" INTEGER,
ALTER COLUMN "competition_id" SET NOT NULL;

-- DropTable
DROP TABLE "JudgeSubmission";

-- CreateTable
CREATE TABLE "EvaluationParameter" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "competition_id" INTEGER NOT NULL,
    "parameterName" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvaluationParameter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Score" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "judge_id" INTEGER NOT NULL,
    "submission_id" INTEGER NOT NULL,
    "parameter_id" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EvaluationParameter_uuid_key" ON "EvaluationParameter"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Score_uuid_key" ON "Score"("uuid");

-- AddForeignKey
ALTER TABLE "Judges" ADD CONSTRAINT "Judges_submissions_id_fkey" FOREIGN KEY ("submissions_id") REFERENCES "Submissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationParameter" ADD CONSTRAINT "EvaluationParameter_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "Competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_judge_id_fkey" FOREIGN KEY ("judge_id") REFERENCES "Judges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "Submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_parameter_id_fkey" FOREIGN KEY ("parameter_id") REFERENCES "EvaluationParameter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
