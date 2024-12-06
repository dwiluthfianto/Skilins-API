-- DropForeignKey
ALTER TABLE "Judges" DROP CONSTRAINT "Judges_competition_id_fkey";

-- AddForeignKey
ALTER TABLE "Judges" ADD CONSTRAINT "Judges_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "Competitions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
