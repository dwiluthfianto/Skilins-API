-- CreateTable
CREATE TABLE "Winners" (
    "id" SERIAL NOT NULL,
    "competition_id" INTEGER NOT NULL,
    "submission_id" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,

    CONSTRAINT "Winners_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Winners" ADD CONSTRAINT "Winners_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "Competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Winners" ADD CONSTRAINT "Winners_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "Submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
