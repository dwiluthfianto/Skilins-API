/*
  Warnings:

  - You are about to drop the `Content` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ContentToTags` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `Categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Tags` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `avatar` to the `Categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Categories` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AudioPodcasts" DROP CONSTRAINT "AudioPodcasts_content_id_fkey";

-- DropForeignKey
ALTER TABLE "Blogs" DROP CONSTRAINT "Blogs_content_id_fkey";

-- DropForeignKey
ALTER TABLE "Comments" DROP CONSTRAINT "Comments_content_id_fkey";

-- DropForeignKey
ALTER TABLE "Content" DROP CONSTRAINT "Content_category_id_fkey";

-- DropForeignKey
ALTER TABLE "Ebooks" DROP CONSTRAINT "Ebooks_content_id_fkey";

-- DropForeignKey
ALTER TABLE "Likes" DROP CONSTRAINT "Likes_content_id_fkey";

-- DropForeignKey
ALTER TABLE "Novels" DROP CONSTRAINT "Novels_content_id_fkey";

-- DropForeignKey
ALTER TABLE "PklReports" DROP CONSTRAINT "PklReports_content_id_fkey";

-- DropForeignKey
ALTER TABLE "VideoPodcasts" DROP CONSTRAINT "VideoPodcasts_content_id_fkey";

-- DropForeignKey
ALTER TABLE "_ContentToTags" DROP CONSTRAINT "_ContentToTags_A_fkey";

-- DropForeignKey
ALTER TABLE "_ContentToTags" DROP CONSTRAINT "_ContentToTags_B_fkey";

-- AlterTable
ALTER TABLE "Categories" ADD COLUMN     "avatar" TEXT NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL;

-- DropTable
DROP TABLE "Content";

-- DropTable
DROP TABLE "_ContentToTags";

-- CreateTable
CREATE TABLE "Contents" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "type" "ContentType" NOT NULL,
    "title" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "subjects" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "category_id" INTEGER NOT NULL,

    CONSTRAINT "Contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ContentsToTags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Contents_uuid_key" ON "Contents"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "_ContentsToTags_AB_unique" ON "_ContentsToTags"("A", "B");

-- CreateIndex
CREATE INDEX "_ContentsToTags_B_index" ON "_ContentsToTags"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Categories_name_key" ON "Categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tags_name_key" ON "Tags"("name");

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Contents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Contents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contents" ADD CONSTRAINT "Contents_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoPodcasts" ADD CONSTRAINT "VideoPodcasts_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Contents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudioPodcasts" ADD CONSTRAINT "AudioPodcasts_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Contents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blogs" ADD CONSTRAINT "Blogs_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Contents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ebooks" ADD CONSTRAINT "Ebooks_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Contents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Novels" ADD CONSTRAINT "Novels_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Contents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PklReports" ADD CONSTRAINT "PklReports_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Contents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContentsToTags" ADD CONSTRAINT "_ContentsToTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContentsToTags" ADD CONSTRAINT "_ContentsToTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
