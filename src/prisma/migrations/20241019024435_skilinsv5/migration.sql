-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "resetPasswordToken" TEXT,
ADD COLUMN     "resetTokenExpires" TIMESTAMP(3);
