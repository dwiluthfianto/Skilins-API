/*
  Warnings:

  - You are about to drop the column `synopsis` on the `Stories` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Stories` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Stories" DROP COLUMN "synopsis",
DROP COLUMN "title";
