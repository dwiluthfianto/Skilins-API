import { CreateNovelDto } from './dto/create-novel.dto';
import { UpdateNovelDto } from './dto/update-novel.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UuidHelper } from 'src/common/helpers/uuid.helper';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NovelsService {
  constructor(
    private prisma: PrismaService,
    private readonly uuidHelper: UuidHelper,
  ) {}

  async create(createNovelDto: CreateNovelDto) {
    const {
      title,
      thumbnail,
      description,
      subjects,
      category_uuid,
      author_uuid,
      pages,
      file_url,
    } = createNovelDto;

    const content = await this.prisma.contents.create({
      data: {
        type: 'Novel',
        title,
        thumbnail,
        description,
        subjects,
        category: { connect: { uuid: category_uuid } },
        Novel: {
          create: {
            author: { connect: { uuid: author_uuid } },
            pages,
            file_url,
          },
        },
      },
    });

    return {
      status: 'success',
      message: 'Novel succesfully added.',
      data: {
        uuid: content.uuid,
      },
    };
  }

  async findAll() {
    const contents = await this.prisma.contents.findMany({
      where: { type: 'Novel' },
      include: {
        category: true,
        tags: true,
        likes: true,
        comments: true,
        Novel: {
          include: {
            author: true,
          },
        },
      },
    });

    return {
      status: 'success',
      data: contents.map((content) => ({
        uuid: content.uuid,
        thumbnail: content.thumbnail,
        title: content.title,
        description: content.description,
        subjects: content.subjects,
        create_at: content.created_at,
        updated_at: content.updated_at,
        category: content.category.name,
        author: content.Novel[0].author.name,
        pages: content.Novel[0].pages,
        file_url: content.Novel[0].file_url,
        tags: content.tags.map((tag) => ({
          uuid: tag.uuid,
          name: tag.name,
        })),
        comments: content.comments.map((comment) => ({
          uuid: comment.uuid,
          subject: comment.comment_content,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          commented_by: comment.commented_by,
        })),
        likes: content.likes.map((like) => ({
          uuid: like.uuid,
          created_at: like.created_at,
          liked_by: like.liked_by,
        })),
      })),
    };
  }

  async findOne(uuid: string) {
    const content = await this.prisma.contents.findUniqueOrThrow({
      where: { uuid, type: 'Novel' },
      include: {
        category: true,
        tags: true,
        likes: true,
        comments: true,
        Novel: {
          include: {
            author: true,
          },
        },
      },
    });

    return {
      status: 'success',
      data: {
        uuid: content.uuid,
        thumbnail: content.thumbnail,
        title: content.title,
        description: content.description,
        subjects: content.subjects,
        create_at: content.created_at,
        updated_at: content.updated_at,
        category: content.category.name,
        author: content.Novel[0].author.name,
        pages: content.Novel[0].pages,
        file_url: content.Novel[0].file_url,
        tags: content.tags.map((tag) => ({
          uuid: tag.uuid,
          name: tag.name,
        })),
        comments: content.comments.map((comment) => ({
          uuid: comment.uuid,
          subject: comment.comment_content,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          commented_by: comment.commented_by,
        })),
        likes: content.likes.map((like) => ({
          uuid: like.uuid,
          created_at: like.created_at,
          liked_by: like.liked_by,
        })),
      },
    };
  }

  async update(uuid: string, updateNovelDto: UpdateNovelDto) {
    const {
      title,
      thumbnail,
      description,
      subjects,
      category_uuid,
      pages,
      file_url,
    } = updateNovelDto;

    const content = await this.uuidHelper.validateUuidContent(uuid);
    const category = await this.uuidHelper.validateUuidContent(category_uuid);
    const author = await this.uuidHelper.validateUuidContent(category_uuid);

    const novel = await this.prisma.contents.update({
      where: {
        uuid,
        type: 'Novel',
      },
      data: {
        title,
        thumbnail,
        description,
        subjects,
        category: { connect: { id: category.id } },
        Novel: {
          update: {
            where: { content_id: content.id },
            data: {
              author_id: author.id,
              pages,
              file_url,
            },
          },
        },
      },
    });

    return {
      status: 'success',
      message: 'Novel succesfully updated.',
      data: {
        uuid: novel.uuid,
      },
    };
  }

  async remove(uuid: string) {
    await this.uuidHelper.validateUuidContent(uuid);

    const novel = await this.prisma.contents.delete({
      where: { uuid, type: 'Novel' },
    });

    return {
      status: 'success',
      message: 'Novel have been removed',
      data: {
        uuid: novel.uuid,
      },
    };
  }
}
