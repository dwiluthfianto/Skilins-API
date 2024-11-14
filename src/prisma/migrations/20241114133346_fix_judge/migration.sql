-- AlterTable
ALTER TABLE "Judges" ALTER COLUMN "submission_id" DROP NOT NULL,
ALTER COLUMN "score" DROP NOT NULL,
ALTER COLUMN "competition_id" DROP NOT NULL;
