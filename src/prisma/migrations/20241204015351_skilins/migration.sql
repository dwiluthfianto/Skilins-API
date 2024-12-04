/*
  Warnings:

  - You are about to drop the column `comment` on the `Judges` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `Judges` table. All the data in the column will be lost.
  - You are about to drop the column `submission_id` on the `Judges` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Judges" DROP CONSTRAINT "Judges_submission_id_fkey";

-- AlterTable
ALTER TABLE "Judges" DROP COLUMN "comment",
DROP COLUMN "score",
DROP COLUMN "submission_id",
ADD COLUMN     "submissionsId" INTEGER;

-- CreateTable
CREATE TABLE "JudgeSubmission" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "judge_id" INTEGER NOT NULL,
    "submission_id" INTEGER NOT NULL,
    "score" DOUBLE PRECISION,
    "comment" TEXT,

    CONSTRAINT "JudgeSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JudgeSubmission_uuid_key" ON "JudgeSubmission"("uuid");

-- AddForeignKey
ALTER TABLE "Judges" ADD CONSTRAINT "Judges_submissionsId_fkey" FOREIGN KEY ("submissionsId") REFERENCES "Submissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JudgeSubmission" ADD CONSTRAINT "JudgeSubmission_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "Submissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JudgeSubmission" ADD CONSTRAINT "JudgeSubmission_judge_id_fkey" FOREIGN KEY ("judge_id") REFERENCES "Judges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
