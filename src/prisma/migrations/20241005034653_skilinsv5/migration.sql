/*
  Warnings:

  - You are about to drop the column `age` on the `Students` table. All the data in the column will be lost.
  - Added the required column `sex` to the `Students` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "sexType" AS ENUM ('male', 'female');

-- DropForeignKey
ALTER TABLE "VideoPodcasts" DROP CONSTRAINT "VideoPodcasts_content_id_fkey";

-- AlterTable
ALTER TABLE "Students" DROP COLUMN "age",
ADD COLUMN     "sex" "sexType" NOT NULL;

-- AddForeignKey
ALTER TABLE "VideoPodcasts" ADD CONSTRAINT "VideoPodcasts_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Contents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
