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
      category_name,
      author_uuid,
      pages,
      file_url,
      tags,
    } = createNovelDto;

    let parsedTags;

    if (Array.isArray(tags)) {
      parsedTags = tags;
    } else if (typeof tags === 'string') {
      try {
        parsedTags = JSON.parse(tags);
      } catch (error) {
        console.error('Failed to parse tags:', error);
        throw new Error('Invalid JSON format for tags');
      }
    } else {
      parsedTags = [];
    }

    let parsedSubjects;
    if (Array.isArray(subjects)) {
      parsedSubjects = subjects;
    } else if (typeof subjects === 'string') {
      try {
        parsedSubjects = JSON.parse(subjects);
      } catch (error) {
        console.error('Failed to parse subjects:', error);
        throw new Error('Invalid JSON format for subjects');
      }
    } else {
      parsedSubjects = [];
    }

    const content = await this.prisma.contents.create({
      data: {
        type: 'Novel',
        title,
        thumbnail,
        description,
        subjects: parsedSubjects,
        category: { connect: { name: category_name } },
        Novel: {
          create: {
            author: { connect: { uuid: author_uuid } },
            pages,
            file_url,
          },
        },
        tags: {
          connectOrCreate: parsedTags?.map((tag) => ({
            where: { name: tag.name },
            create: {
              name: tag.name,
              avatar_url:
                tag.avatar_url ||
                'https://images.unsplash.com/photo-1494537176433-7a3c4ef2046f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
              description: tag.description || 'No description available.',
            },
          })),
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

  async findAll(page: number, limit: number) {
    const contents = await this.prisma.contents.findMany({
      skip: (page - 1) * limit,
      take: limit,
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
    const total = await this.prisma.novels.count();
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
      totalPage: total,
      page,
      lastPage: Math.ceil(total / limit),
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
      category_name,
      author_uuid,
      pages,
      file_url,
      tags,
    } = updateNovelDto;

    const content = await this.uuidHelper.validateUuidContent(uuid);
    const category = await this.uuidHelper.validateUuidCategory(category_name);
    const author = await this.uuidHelper.validateUuidCreator(author_uuid);

    let parsedTags;

    if (Array.isArray(tags)) {
      parsedTags = tags;
    } else if (typeof tags === 'string') {
      try {
        parsedTags = JSON.parse(tags);
      } catch (error) {
        console.error('Failed to parse tags:', error);
        throw new Error('Invalid JSON format for tags');
      }
    } else {
      parsedTags = [];
    }

    let parsedSubjects;
    if (Array.isArray(subjects)) {
      parsedSubjects = subjects;
    } else if (typeof subjects === 'string') {
      try {
        parsedSubjects = JSON.parse(subjects);
      } catch (error) {
        console.error('Failed to parse subjects:', error);
        throw new Error('Invalid JSON format for subjects');
      }
    } else {
      parsedSubjects = [];
    }
    const novel = await this.prisma.contents.update({
      where: {
        uuid,
        type: 'Novel',
      },
      data: {
        title,
        thumbnail,
        description,
        subjects: parsedSubjects,
        category: { connect: { name: category.name } },
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
        tags: {
          connectOrCreate: parsedTags?.map((tag) => ({
            where: { name: tag.name },
            create: {
              name: tag.name,
              avatar_url:
                tag.avatar_url ||
                'https://images.unsplash.com/photo-1494537176433-7a3c4ef2046f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
              description: tag.description || 'No description available.',
            },
          })),
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
