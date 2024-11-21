/*
  Warnings:

  - You are about to drop the column `episodesId` on the `Ratings` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[content_id,rating_by]` on the table `Ratings` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[episode_id,rating_by]` on the table `Ratings` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Ratings" DROP CONSTRAINT "Ratings_episodesId_fkey";

-- AlterTable
ALTER TABLE "Ratings" DROP COLUMN "episodesId",
ADD COLUMN     "episode_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Ratings_content_id_rating_by_key" ON "Ratings"("content_id", "rating_by");

-- CreateIndex
CREATE UNIQUE INDEX "Ratings_episode_id_rating_by_key" ON "Ratings"("episode_id", "rating_by");

-- AddForeignKey
ALTER TABLE "Ratings" ADD CONSTRAINT "Ratings_episode_id_fkey" FOREIGN KEY ("episode_id") REFERENCES "Episodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
