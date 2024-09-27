import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEbookDto } from './dto/create-ebook.dto';
import { UpdateEbookDto } from './dto/update-ebook.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EbooksService {
  constructor(private prisma: PrismaService) {}

  async create(createContentDto: CreateEbookDto) {
    const {
      title,
      thumbnail,
      description,
      subjects,
      category_uuid,
      author,
      pages,
      publication,
      file_url,
      isbn,
      release_date,
    } = createContentDto;

    const content = await this.prisma.contents.create({
      data: {
        type: 'Ebook',
        title,
        thumbnail,
        description,
        subjects,
        category: { connect: { uuid: category_uuid } },
        Ebooks: {
          create: {
            author: author,
            pages: pages,
            publication: publication,
            file_url: file_url,
            isbn: isbn,
            release_date: release_date,
          },
        },
      },
    });

    return {
      status: 'success',
      message: 'Ebook succesfully added.',
      data: {
        id: content.uuid,
      },
    };
  }

  async findAll() {
    const contents = await this.prisma.contents.findMany({
      where: { type: 'Ebook' },
      include: {
        category: true,
        tags: true,
        comments: true,
        likes: true,
        Ebooks: true,
      },
    });

    return {
      status: 'success',
      data: contents.map((content) => ({
        id: content.uuid,
        thumbnail: content.thumbnail,
        title: content.title,
        description: content.description,
        subjects: content.subjects,
        create_at: content.created_at,
        updated_at: content.updated_at,
        category: content.category.name,
        author: content.Ebooks[0].author,
        pages: content.Ebooks[0].pages,
        publication: content.Ebooks[0].publication,
        file: content.Ebooks[0].file_url,
        isbn: content.Ebooks[0].isbn,
        release_date: content.Ebooks[0].release_date,
        tags: content.tags.map((tag) => ({
          id: tag.uuid,
          name: tag.name,
        })),
        comments: content.comments.map((comment) => ({
          id: comment.uuid,
          subject: comment.subject,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          commented_by: comment.commented_by,
        })),
        likes: content.likes.map((like) => ({
          id: like.uuid,
          created_at: like.created_at,
          liked_by: like.liked_by,
        })),
      })),
    };
  }

  async findOne(id: string) {
    const content = await this.prisma.contents.findUnique({
      where: { uuid: id },
      include: {
        category: true,
        tags: true,
        comments: true,
        likes: true,
        Ebooks: true,
      },
    });

    if (!content) {
      throw new NotFoundException(`Ebook with ${id} does not exist.`);
    }

    return {
      status: 'success',
      data: {
        id: content.uuid,
        thumbnail: content.thumbnail,
        title: content.title,
        description: content.description,
        subjects: content.subjects,
        create_at: content.created_at,
        updated_at: content.updated_at,
        category: content.category.name,
        author: content.Ebooks[0].author,
        pages: content.Ebooks[0].pages,
        publication: content.Ebooks[0].publication,
        file: content.Ebooks[0].file_url,
        isbn: content.Ebooks[0].isbn,
        release_date: content.Ebooks[0].release_date,
        tags: content.tags.map((tag) => ({
          id: tag.uuid,
          name: tag.name,
        })),
        comments: content.comments.map((comment) => ({
          id: comment.uuid,
          subject: comment.subject,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          commented_by: comment.commented_by,
        })),
        likes: content.likes.map((like) => ({
          id: like.uuid,
          created_at: like.created_at,
          liked_by: like.liked_by,
        })),
      },
    };
  }

  async update(id: string, updateContentDto: UpdateEbookDto) {
    const {
      title,
      thumbnail,
      description,
      subjects,
      category_uuid,
      author,
      pages,
      publication,
      file_url,
      isbn,
      release_date,
    } = updateContentDto;

    const isExists = await this.prisma.contents.findUnique({
      where: { uuid: id },
    });

    if (!isExists) {
      throw new NotFoundException(`Ebook with ID ${id} not found`);
    }

    const content = await this.prisma.contents.update({
      where: { uuid: id, type: 'Ebook' },
      data: {
        title,
        thumbnail,
        description,
        subjects,
        category: { connect: { uuid: category_uuid } },
        Ebooks: {
          update: {
            where: { content_id: isExists.id },
            data: { author, pages, publication, file_url, isbn, release_date },
          },
        },
      },
    });

    return {
      status: 'success',
      message: 'Ebook succesfully updated.',
      data: {
        id: content.uuid,
      },
    };
  }

  async remove(id: string) {
    const isExists = await this.prisma.contents.findUnique({
      where: { uuid: id },
    });

    if (!isExists) {
      throw new NotFoundException(`Ebook with ID ${id} not found`);
    }

    const content = await this.prisma.contents.delete({
      where: { uuid: id, type: 'Ebook' },
    });

    return {
      status: 'success',
      message: 'Ebook have been removed',
      data: {
        id: content.uuid,
      },
    };
  }
}
