-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('Admin', 'Student', 'User', 'Staff', 'Judge');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('Ebook', 'VideoPodcast', 'AudioPodcast', 'Story', 'Prakerin', 'Blog');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SexType" AS ENUM ('male', 'female');

-- CreateTable
CREATE TABLE "Users" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "profile_url" TEXT,
    "password" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "resetPasswordToken" TEXT,
    "resetTokenExpires" TIMESTAMP(3),
    "refreshToken" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "roles_id" INTEGER NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Roles" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" "RoleType" NOT NULL DEFAULT 'User',

    CONSTRAINT "Roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ratings" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "content_id" INTEGER NOT NULL,
    "rating_by" INTEGER NOT NULL,
    "rating_value" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comments" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "content_id" INTEGER NOT NULL,
    "comment_content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "commented_by" INTEGER NOT NULL,

    CONSTRAINT "Comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contents" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "type" "ContentType" NOT NULL,
    "title" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "description" TEXT,
    "subjects" TEXT[],
    "slug" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "category_id" INTEGER NOT NULL,

    CONSTRAINT "Contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categories" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "avatar_url" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Categories_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "VideoPodcasts" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "file_url" TEXT NOT NULL,
    "creator_id" INTEGER NOT NULL,
    "content_id" INTEGER NOT NULL,

    CONSTRAINT "VideoPodcasts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AudioPodcasts" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "file_url" TEXT NOT NULL,
    "creator_id" INTEGER NOT NULL,
    "content_id" INTEGER NOT NULL,

    CONSTRAINT "AudioPodcasts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Blogs" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "blog_content" TEXT NOT NULL,
    "author_id" INTEGER NOT NULL,
    "published" BOOLEAN NOT NULL,
    "published_at" TIMESTAMP(3) NOT NULL,
    "content_id" INTEGER NOT NULL,

    CONSTRAINT "Blogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ebooks" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "pages" INTEGER NOT NULL,
    "publication" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "isbn" TEXT NOT NULL,
    "release_date" TIMESTAMP(3) NOT NULL,
    "content_id" INTEGER NOT NULL,

    CONSTRAINT "Ebooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stories" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "synopsis" TEXT,
    "author_id" INTEGER NOT NULL,
    "content_id" INTEGER NOT NULL,

    CONSTRAINT "Stories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Episodes" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "story_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Episodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prakerin" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "author_id" INTEGER NOT NULL,
    "pages" INTEGER NOT NULL,
    "file_url" TEXT NOT NULL,
    "published_at" TIMESTAMP(3) NOT NULL,
    "content_id" INTEGER NOT NULL,

    CONSTRAINT "Prakerin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submissions" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "student_id" INTEGER NOT NULL,
    "content_id" INTEGER NOT NULL,
    "competition_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Judges" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "submission_id" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Judges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Competitions" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Competitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Students" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "image_url" TEXT,
    "nis" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "major_id" INTEGER NOT NULL,
    "birthplace" TEXT,
    "birthdate" TIMESTAMP(3),
    "sex" "SexType" NOT NULL,
    "status" BOOLEAN NOT NULL,

    CONSTRAINT "Students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Majors" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image_url" TEXT,
    "description" TEXT,
    "avatar_url" TEXT,

    CONSTRAINT "Majors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ContentsToTags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_uuid_key" ON "Users"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Users_refreshToken_key" ON "Users"("refreshToken");

-- CreateIndex
CREATE UNIQUE INDEX "Roles_uuid_key" ON "Roles"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Ratings_uuid_key" ON "Ratings"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Comments_uuid_key" ON "Comments"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Contents_uuid_key" ON "Contents"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Contents_slug_key" ON "Contents"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Categories_uuid_key" ON "Categories"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Categories_name_key" ON "Categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tags_uuid_key" ON "Tags"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Tags_name_key" ON "Tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "VideoPodcasts_uuid_key" ON "VideoPodcasts"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "VideoPodcasts_content_id_key" ON "VideoPodcasts"("content_id");

-- CreateIndex
CREATE UNIQUE INDEX "AudioPodcasts_uuid_key" ON "AudioPodcasts"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "AudioPodcasts_content_id_key" ON "AudioPodcasts"("content_id");

-- CreateIndex
CREATE UNIQUE INDEX "Blogs_uuid_key" ON "Blogs"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Blogs_content_id_key" ON "Blogs"("content_id");

-- CreateIndex
CREATE UNIQUE INDEX "Ebooks_uuid_key" ON "Ebooks"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Ebooks_content_id_key" ON "Ebooks"("content_id");

-- CreateIndex
CREATE UNIQUE INDEX "Stories_uuid_key" ON "Stories"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Stories_content_id_key" ON "Stories"("content_id");

-- CreateIndex
CREATE UNIQUE INDEX "Episodes_uuid_key" ON "Episodes"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Prakerin_uuid_key" ON "Prakerin"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Prakerin_content_id_key" ON "Prakerin"("content_id");

-- CreateIndex
CREATE UNIQUE INDEX "Submissions_uuid_key" ON "Submissions"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Judges_uuid_key" ON "Judges"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Competitions_uuid_key" ON "Competitions"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Students_uuid_key" ON "Students"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Students_nis_key" ON "Students"("nis");

-- CreateIndex
CREATE UNIQUE INDEX "Majors_uuid_key" ON "Majors"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Majors_name_key" ON "Majors"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_ContentsToTags_AB_unique" ON "_ContentsToTags"("A", "B");

-- CreateIndex
CREATE INDEX "_ContentsToTags_B_index" ON "_ContentsToTags"("B");

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_roles_id_fkey" FOREIGN KEY ("roles_id") REFERENCES "Roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ratings" ADD CONSTRAINT "Ratings_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ratings" ADD CONSTRAINT "Ratings_rating_by_fkey" FOREIGN KEY ("rating_by") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_commented_by_fkey" FOREIGN KEY ("commented_by") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contents" ADD CONSTRAINT "Contents_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoPodcasts" ADD CONSTRAINT "VideoPodcasts_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "Students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoPodcasts" ADD CONSTRAINT "VideoPodcasts_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudioPodcasts" ADD CONSTRAINT "AudioPodcasts_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "Students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudioPodcasts" ADD CONSTRAINT "AudioPodcasts_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blogs" ADD CONSTRAINT "Blogs_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blogs" ADD CONSTRAINT "Blogs_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ebooks" ADD CONSTRAINT "Ebooks_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stories" ADD CONSTRAINT "Stories_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "Students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stories" ADD CONSTRAINT "Stories_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Episodes" ADD CONSTRAINT "Episodes_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "Stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prakerin" ADD CONSTRAINT "Prakerin_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "Students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prakerin" ADD CONSTRAINT "Prakerin_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submissions" ADD CONSTRAINT "Submissions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submissions" ADD CONSTRAINT "Submissions_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submissions" ADD CONSTRAINT "Submissions_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "Competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Judges" ADD CONSTRAINT "Judges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Judges" ADD CONSTRAINT "Judges_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "Submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Students" ADD CONSTRAINT "Students_major_id_fkey" FOREIGN KEY ("major_id") REFERENCES "Majors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContentsToTags" ADD CONSTRAINT "_ContentsToTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContentsToTags" ADD CONSTRAINT "_ContentsToTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
