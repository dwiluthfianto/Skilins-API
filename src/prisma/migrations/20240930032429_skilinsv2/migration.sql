/*
  Warnings:

  - You are about to drop the column `comment` on the `Comments` table. All the data in the column will be lost.
  - You are about to drop the column `subject` on the `Comments` table. All the data in the column will be lost.
  - Added the required column `comment_content` to the `Comments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Comments" DROP COLUMN "comment",
DROP COLUMN "subject",
ADD COLUMN     "comment_content" TEXT NOT NULL;
