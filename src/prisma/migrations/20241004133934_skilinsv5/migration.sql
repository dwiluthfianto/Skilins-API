-- AlterTable
ALTER TABLE "Categories" ALTER COLUMN "avatar_url" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Contents" ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Majors" ALTER COLUMN "image_url" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "avatar_url" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Students" ALTER COLUMN "image_url" DROP NOT NULL,
ALTER COLUMN "birthplace" DROP NOT NULL,
ALTER COLUMN "birthdate" DROP NOT NULL,
ALTER COLUMN "age" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Tags" ALTER COLUMN "avatar_url" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Users" ALTER COLUMN "profile_url" DROP NOT NULL,
ALTER COLUMN "refreshToken" DROP NOT NULL;
