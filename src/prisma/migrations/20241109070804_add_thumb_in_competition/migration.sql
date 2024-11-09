/*
  Warnings:

  - Added the required column `thumbnail` to the `Competitions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Competitions" ADD COLUMN     "thumbnail" TEXT NOT NULL;
