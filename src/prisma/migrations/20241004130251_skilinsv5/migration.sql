/*
  Warnings:

  - Added the required column `profile_url` to the `Users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `refreshToken` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "profile_url" TEXT NOT NULL,
ADD COLUMN     "refreshToken" TEXT NOT NULL;
