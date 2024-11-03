/*
  Warnings:

  - Added the required column `submission_deadline` to the `Competitions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Competitions" ADD COLUMN     "submission_deadline" TIMESTAMP(3) NOT NULL;
