/*
  Warnings:

  - You are about to drop the `Tags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ContentsToTags` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ContentsToTags" DROP CONSTRAINT "_ContentsToTags_A_fkey";

-- DropForeignKey
ALTER TABLE "_ContentsToTags" DROP CONSTRAINT "_ContentsToTags_B_fkey";

-- DropTable
DROP TABLE "Tags";

-- DropTable
DROP TABLE "_ContentsToTags";

-- CreateTable
CREATE TABLE "Genres" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "avatar_url" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Genres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ContentsToGenres" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Genres_uuid_key" ON "Genres"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Genres_name_key" ON "Genres"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_ContentsToGenres_AB_unique" ON "_ContentsToGenres"("A", "B");

-- CreateIndex
CREATE INDEX "_ContentsToGenres_B_index" ON "_ContentsToGenres"("B");

-- AddForeignKey
ALTER TABLE "_ContentsToGenres" ADD CONSTRAINT "_ContentsToGenres_A_fkey" FOREIGN KEY ("A") REFERENCES "Contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContentsToGenres" ADD CONSTRAINT "_ContentsToGenres_B_fkey" FOREIGN KEY ("B") REFERENCES "Genres"("id") ON DELETE CASCADE ON UPDATE CASCADE;
