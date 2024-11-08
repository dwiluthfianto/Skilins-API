-- AlterTable
ALTER TABLE "Comments" ADD COLUMN     "episodesId" INTEGER;

-- AlterTable
ALTER TABLE "Ratings" ADD COLUMN     "episodesId" INTEGER;

-- AddForeignKey
ALTER TABLE "Ratings" ADD CONSTRAINT "Ratings_episodesId_fkey" FOREIGN KEY ("episodesId") REFERENCES "Episodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_episodesId_fkey" FOREIGN KEY ("episodesId") REFERENCES "Episodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
