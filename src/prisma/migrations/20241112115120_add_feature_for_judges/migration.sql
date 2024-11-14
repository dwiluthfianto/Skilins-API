/*
  Warnings:

  - Added the required column `competition_id` to the `Judges` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Judges" ADD COLUMN     "competition_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Judges" ADD CONSTRAINT "Judges_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "Competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
