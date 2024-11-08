/*
  Warnings:

  - The values [male,female] on the enum `SexType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `blog_content` on the `Blogs` table. All the data in the column will be lost.
  - You are about to drop the column `published` on the `Blogs` table. All the data in the column will be lost.
  - You are about to drop the column `published_at` on the `Blogs` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SexType_new" AS ENUM ('Male', 'Female');
ALTER TABLE "Students" ALTER COLUMN "sex" TYPE "SexType_new" USING ("sex"::text::"SexType_new");
ALTER TYPE "SexType" RENAME TO "SexType_old";
ALTER TYPE "SexType_new" RENAME TO "SexType";
DROP TYPE "SexType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Blogs" DROP COLUMN "blog_content",
DROP COLUMN "published",
DROP COLUMN "published_at";
