-- DropForeignKey
ALTER TABLE "AudioPodcasts" DROP CONSTRAINT "AudioPodcasts_content_id_fkey";

-- DropForeignKey
ALTER TABLE "Blogs" DROP CONSTRAINT "Blogs_content_id_fkey";

-- DropForeignKey
ALTER TABLE "Ebooks" DROP CONSTRAINT "Ebooks_content_id_fkey";

-- DropForeignKey
ALTER TABLE "Novels" DROP CONSTRAINT "Novels_content_id_fkey";

-- DropForeignKey
ALTER TABLE "PklReports" DROP CONSTRAINT "PklReports_content_id_fkey";

-- DropForeignKey
ALTER TABLE "VideoPodcasts" DROP CONSTRAINT "VideoPodcasts_content_id_fkey";

-- AddForeignKey
ALTER TABLE "VideoPodcasts" ADD CONSTRAINT "VideoPodcasts_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudioPodcasts" ADD CONSTRAINT "AudioPodcasts_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blogs" ADD CONSTRAINT "Blogs_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ebooks" ADD CONSTRAINT "Ebooks_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Novels" ADD CONSTRAINT "Novels_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PklReports" ADD CONSTRAINT "PklReports_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
