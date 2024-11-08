/*
  Warnings:

  - You are about to drop the column `subjects` on the `Contents` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Competitions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[order]` on the table `Episodes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `guide` to the `Competitions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Competitions` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `Competitions` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Competitions" ADD COLUMN     "guide" TEXT NOT NULL,
ADD COLUMN     "slug" TEXT NOT NULL,
ALTER COLUMN "description" SET NOT NULL;

-- AlterTable
ALTER TABLE "Contents" DROP COLUMN "subjects";

-- CreateTable
CREATE TABLE "Tags" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "avatar_url" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ContentsToTags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Tags_uuid_key" ON "Tags"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Tags_name_key" ON "Tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_ContentsToTags_AB_unique" ON "_ContentsToTags"("A", "B");

-- CreateIndex
CREATE INDEX "_ContentsToTags_B_index" ON "_ContentsToTags"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Competitions_slug_key" ON "Competitions"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Episodes_order_key" ON "Episodes"("order");

-- AddForeignKey
ALTER TABLE "_ContentsToTags" ADD CONSTRAINT "_ContentsToTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContentsToTags" ADD CONSTRAINT "_ContentsToTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
