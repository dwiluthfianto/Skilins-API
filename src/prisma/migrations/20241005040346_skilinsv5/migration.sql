/*
  Warnings:

  - Changed the type of `sex` on the `Students` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "SexType" AS ENUM ('male', 'female');

-- DropForeignKey
ALTER TABLE "AudioPodcasts" DROP CONSTRAINT "AudioPodcasts_creator_id_fkey";

-- DropForeignKey
ALTER TABLE "Blogs" DROP CONSTRAINT "Blogs_author_id_fkey";

-- DropForeignKey
ALTER TABLE "Comments" DROP CONSTRAINT "Comments_commented_by_fkey";

-- DropForeignKey
ALTER TABLE "Comments" DROP CONSTRAINT "Comments_content_id_fkey";

-- DropForeignKey
ALTER TABLE "Likes" DROP CONSTRAINT "Likes_content_id_fkey";

-- DropForeignKey
ALTER TABLE "Likes" DROP CONSTRAINT "Likes_liked_by_fkey";

-- DropForeignKey
ALTER TABLE "Novels" DROP CONSTRAINT "Novels_author_id_fkey";

-- DropForeignKey
ALTER TABLE "PklReports" DROP CONSTRAINT "PklReports_author_id_fkey";

-- DropForeignKey
ALTER TABLE "VideoPodcasts" DROP CONSTRAINT "VideoPodcasts_content_id_fkey";

-- DropForeignKey
ALTER TABLE "VideoPodcasts" DROP CONSTRAINT "VideoPodcasts_creator_id_fkey";

-- AlterTable
ALTER TABLE "Students" DROP COLUMN "sex",
ADD COLUMN     "sex" "SexType" NOT NULL;

-- DropEnum
DROP TYPE "sexType";

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_liked_by_fkey" FOREIGN KEY ("liked_by") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_commented_by_fkey" FOREIGN KEY ("commented_by") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoPodcasts" ADD CONSTRAINT "VideoPodcasts_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "Students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoPodcasts" ADD CONSTRAINT "VideoPodcasts_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudioPodcasts" ADD CONSTRAINT "AudioPodcasts_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "Students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blogs" ADD CONSTRAINT "Blogs_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Novels" ADD CONSTRAINT "Novels_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "Students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PklReports" ADD CONSTRAINT "PklReports_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "Students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
