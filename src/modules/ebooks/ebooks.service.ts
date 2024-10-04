import { Injectable } from '@nestjs/common';
import { CreateEbookDto } from './dto/create-ebook.dto';
import { UpdateEbookDto } from './dto/update-ebook.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UuidHelper } from 'src/common/helpers/uuid.helper';

@Injectable()
export class EbooksService {
  constructor(
    private prisma: PrismaService,
    private readonly uuidHelper: UuidHelper,
  ) {}

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
          subject: comment.comment_content,
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

  async findOne(uuid: string) {
    const content = await this.prisma.contents.findUniqueOrThrow({
      where: { uuid },
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
        file_url: content.Ebooks[0].file_url,
        isbn: content.Ebooks[0].isbn,
        release_date: content.Ebooks[0].release_date,
        tags: content.tags.map((tag) => ({
          id: tag.uuid,
          name: tag.name,
        })),
        comments: content.comments.map((comment) => ({
          id: comment.uuid,
          subject: comment.comment_content,
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

  async update(uuid: string, updateContentDto: UpdateEbookDto) {
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

    const content = await this.uuidHelper.validateUuidContent(uuid);
    const category = await this.uuidHelper.validateUuidCategory(category_uuid);

    const ebook = await this.prisma.contents.update({
      where: { uuid, type: 'Ebook' },
      data: {
        title,
        thumbnail,
        description,
        subjects,
        category: { connect: { id: category.id } },
        Ebooks: {
          update: {
            where: { content_id: content.id },
            data: { author, pages, publication, file_url, isbn, release_date },
          },
        },
      },
    });

    return {
      status: 'success',
      message: 'Ebook succesfully updated.',
      data: {
        id: ebook.uuid,
      },
    };
  }

  async remove(uuid: string) {
    await this.uuidHelper.validateUuidContent(uuid);

    const ebook = await this.prisma.contents.delete({
      where: { uuid, type: 'Ebook' },
    });

    return {
      status: 'success',
      message: 'Ebook succesfully deleted',
      data: {
        id: ebook.uuid,
      },
    };
  }
}
