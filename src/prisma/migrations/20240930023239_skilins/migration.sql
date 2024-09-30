-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('Ebook', 'VideoPodcast', 'AudioPodcast', 'Novel', 'PklReport', 'Blog');

-- CreateTable
CREATE TABLE "Users" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "roles_id" INTEGER NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Roles" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Likes" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "content_id" INTEGER NOT NULL,
    "liked_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comments" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "content_id" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
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
    "description" TEXT NOT NULL,
    "subjects" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "category_id" INTEGER NOT NULL,

    CONSTRAINT "Contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categories" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "avatar_url" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tags" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "avatar_url" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

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
CREATE TABLE "Novels" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "author_id" INTEGER NOT NULL,
    "pages" INTEGER NOT NULL,
    "file_url" TEXT NOT NULL,
    "content_id" INTEGER NOT NULL,

    CONSTRAINT "Novels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PklReports" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "author_id" INTEGER NOT NULL,
    "pages" INTEGER NOT NULL,
    "file_url" TEXT NOT NULL,
    "published_at" TIMESTAMP(3) NOT NULL,
    "content_id" INTEGER NOT NULL,

    CONSTRAINT "PklReports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Students" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "nis" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "major_id" INTEGER NOT NULL,
    "birthplace" TEXT NOT NULL,
    "birthdate" TIMESTAMP(3) NOT NULL,
    "age" INTEGER NOT NULL,
    "status" BOOLEAN NOT NULL,

    CONSTRAINT "Students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Majors" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "avatar_url" TEXT NOT NULL,

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
CREATE UNIQUE INDEX "Users_username_key" ON "Users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Roles_uuid_key" ON "Roles"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Likes_uuid_key" ON "Likes"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Comments_uuid_key" ON "Comments"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Contents_uuid_key" ON "Contents"("uuid");

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
CREATE UNIQUE INDEX "Novels_uuid_key" ON "Novels"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Novels_content_id_key" ON "Novels"("content_id");

-- CreateIndex
CREATE UNIQUE INDEX "PklReports_uuid_key" ON "PklReports"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "PklReports_content_id_key" ON "PklReports"("content_id");

-- CreateIndex
CREATE UNIQUE INDEX "Students_uuid_key" ON "Students"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Students_nis_key" ON "Students"("nis");

-- CreateIndex
CREATE UNIQUE INDEX "Majors_uuid_key" ON "Majors"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "_ContentsToTags_AB_unique" ON "_ContentsToTags"("A", "B");

-- CreateIndex
CREATE INDEX "_ContentsToTags_B_index" ON "_ContentsToTags"("B");

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_roles_id_fkey" FOREIGN KEY ("roles_id") REFERENCES "Roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Contents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_liked_by_fkey" FOREIGN KEY ("liked_by") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Contents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_commented_by_fkey" FOREIGN KEY ("commented_by") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contents" ADD CONSTRAINT "Contents_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoPodcasts" ADD CONSTRAINT "VideoPodcasts_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "Students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoPodcasts" ADD CONSTRAINT "VideoPodcasts_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudioPodcasts" ADD CONSTRAINT "AudioPodcasts_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "Students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudioPodcasts" ADD CONSTRAINT "AudioPodcasts_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blogs" ADD CONSTRAINT "Blogs_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blogs" ADD CONSTRAINT "Blogs_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ebooks" ADD CONSTRAINT "Ebooks_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Novels" ADD CONSTRAINT "Novels_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "Students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Novels" ADD CONSTRAINT "Novels_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PklReports" ADD CONSTRAINT "PklReports_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "Students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PklReports" ADD CONSTRAINT "PklReports_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Students" ADD CONSTRAINT "Students_major_id_fkey" FOREIGN KEY ("major_id") REFERENCES "Majors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContentsToTags" ADD CONSTRAINT "_ContentsToTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContentsToTags" ADD CONSTRAINT "_ContentsToTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
