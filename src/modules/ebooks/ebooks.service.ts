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
      category_name,
      author,
      pages,
      publication,
      file_url,
      isbn,
      release_date,
      tags,
    } = createContentDto;

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
        type: 'Ebook',
        title,
        thumbnail,
        description,
        subjects: parsedSubjects,
        category: { connect: { name: category_name } },
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
      message: 'Ebook succesfully added.',
      data: {
        uuid: content.uuid,
      },
    };
  }

  async findAll(page: number, limit: number) {
    const contents = await this.prisma.contents.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: { type: 'Ebook' },
      include: {
        category: true,
        tags: true,
        comments: {
          include: {
            user: {
              select: {
                uuid: true,
                full_name: true,
                profile_url: true,
              },
            },
          },
        },
        likes: true,
        Ebooks: true,
      },
    });

    const total = await this.prisma.ebooks.count();

    return {
      status: 'success',
      data: contents.map((content) => ({
        uuid: content.uuid,
        thumbnail: content.thumbnail,
        title: content.title,
        description: content.description,
        subjects: content.subjects,
        created_at: content.created_at,
        updated_at: content.updated_at,
        category: content.category.name,
        author: content.Ebooks[0].author,
        pages: content.Ebooks[0].pages,
        publication: content.Ebooks[0].publication,
        file_url: content.Ebooks[0].file_url,
        isbn: content.Ebooks[0].isbn,
        release_date: content.Ebooks[0].release_date,
        tags: content.tags.map((tag) => ({
          uuid: tag.uuid,
          name: tag.name,
        })),
        comments: content.comments.map((comment) => ({
          uuid: comment.uuid,
          subject: comment.comment_content,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          commented_by_uuid: comment.user.uuid,
          commented_by: comment.user.full_name,
          profile: comment.user.profile_url,
        })),
        likes: content.likes.map((like) => ({
          uuid: like.uuid,
          created_at: like.created_at,
          liked_by: like.liked_by,
        })),
      })),
      totalPages: total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }
  async findByCategory(page: number, limit: number, category: string) {
    const contents = await this.prisma.contents.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        type: 'Ebook',
        category: {
          name: {
            equals: category,
            mode: 'insensitive',
          },
        },
      },
      include: {
        category: true,
        tags: true,
        comments: {
          include: {
            user: {
              select: {
                uuid: true,
                full_name: true,
                profile_url: true,
              },
            },
          },
        },
        likes: true,
        Ebooks: true,
      },
    });

    const total = await this.prisma.ebooks.count();

    return {
      status: 'success',
      data: contents.map((content) => ({
        uuid: content.uuid,
        thumbnail: content.thumbnail,
        title: content.title,
        description: content.description,
        subjects: content.subjects,
        created_at: content.created_at,
        updated_at: content.updated_at,
        category: content.category.name,
        author: content.Ebooks[0].author,
        pages: content.Ebooks[0].pages,
        publication: content.Ebooks[0].publication,
        file_url: content.Ebooks[0].file_url,
        isbn: content.Ebooks[0].isbn,
        release_date: content.Ebooks[0].release_date,
        tags: content.tags.map((tag) => ({
          uuid: tag.uuid,
          name: tag.name,
        })),
        comments: content.comments.map((comment) => ({
          uuid: comment.uuid,
          subject: comment.comment_content,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          commented_by_uuid: comment.user.uuid,
          commented_by: comment.user.full_name,
          profile: comment.user.profile_url,
        })),
        likes: content.likes.map((like) => ({
          uuid: like.uuid,
          created_at: like.created_at,
          liked_by: like.liked_by,
        })),
      })),
      totalPages: total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findByTag(page: number, limit: number, tag: string) {
    const contents = await this.prisma.contents.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        type: 'Ebook',
        tags: {
          some: {
            name: {
              equals: tag,
              mode: 'insensitive',
            },
          },
        },
      },
      include: {
        category: true,
        tags: true,
        comments: {
          include: {
            user: {
              select: {
                uuid: true,
                full_name: true,
                profile_url: true,
              },
            },
          },
        },
        likes: true,
        Ebooks: true,
      },
    });

    const total = await this.prisma.ebooks.count();

    return {
      status: 'success',
      data: contents.map((content) => ({
        uuid: content.uuid,
        thumbnail: content.thumbnail,
        title: content.title,
        description: content.description,
        subjects: content.subjects,
        created_at: content.created_at,
        updated_at: content.updated_at,
        category: content.category.name,
        author: content.Ebooks[0].author,
        pages: content.Ebooks[0].pages,
        publication: content.Ebooks[0].publication,
        file_url: content.Ebooks[0].file_url,
        isbn: content.Ebooks[0].isbn,
        release_date: content.Ebooks[0].release_date,
        tags: content.tags.map((tag) => ({
          uuid: tag.uuid,
          name: tag.name,
        })),
        comments: content.comments.map((comment) => ({
          uuid: comment.uuid,
          subject: comment.comment_content,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          commented_by_uuid: comment.user.uuid,
          commented_by: comment.user.full_name,
          profile: comment.user.profile_url,
        })),
        likes: content.likes.map((like) => ({
          uuid: like.uuid,
          created_at: like.created_at,
          liked_by: like.liked_by,
        })),
      })),
      totalPages: total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findLatest(page: number, limit: number, week: number) {
    const currentDate = new Date();
    const oneWeekAgo = new Date();
    const weeks = week * 7;
    oneWeekAgo.setDate(currentDate.getDate() - weeks);
    const contents = await this.prisma.contents.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        type: 'Ebook',
        created_at: {
          gte: oneWeekAgo,
          lte: currentDate,
        },
      },
      orderBy: {
        id: 'asc',
      },
      include: {
        category: true,
        tags: true,
        comments: {
          include: {
            user: {
              select: {
                uuid: true,
                full_name: true,
                profile_url: true,
              },
            },
          },
        },
        likes: true,
        Ebooks: true,
      },
    });

    const total = await this.prisma.ebooks.count();
    return {
      status: 'success',
      data: contents.map((content) => ({
        uuid: content.uuid,
        thumbnail: content.thumbnail,
        title: content.title,
        description: content.description,
        subjects: content.subjects,
        created_at: content.created_at,
        updated_at: content.updated_at,
        category: content.category.name,
        author: content.Ebooks[0].author,
        pages: content.Ebooks[0].pages,
        publication: content.Ebooks[0].publication,
        file_url: content.Ebooks[0].file_url,
        isbn: content.Ebooks[0].isbn,
        release_date: content.Ebooks[0].release_date,
        tags: content.tags.map((tag) => ({
          uuid: tag.uuid,
          name: tag.name,
        })),
        comments: content.comments.map((comment) => ({
          uuid: comment.uuid,
          subject: comment.comment_content,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          commented_by_uuid: comment.user.uuid,
          commented_by: comment.user.full_name,
          profile: comment.user.profile_url,
        })),
        likes: content.likes.map((like) => ({
          uuid: like.uuid,
          created_at: like.created_at,
          liked_by: like.liked_by,
        })),
      })),
      totalPages: total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(uuid: string) {
    const content = await this.prisma.contents.findUniqueOrThrow({
      where: { uuid },
      include: {
        category: true,
        tags: true,
        comments: {
          include: {
            user: {
              select: {
                uuid: true,
                full_name: true,
                profile_url: true,
              },
            },
          },
        },
        likes: true,
        Ebooks: true,
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
        created_at: content.created_at,
        updated_at: content.updated_at,
        category: content.category.name,
        author: content.Ebooks[0].author,
        pages: content.Ebooks[0].pages,
        publication: content.Ebooks[0].publication,
        file_url: content.Ebooks[0].file_url,
        isbn: content.Ebooks[0].isbn,
        release_date: content.Ebooks[0].release_date,
        tags: content.tags.map((tag) => ({
          uuid: tag.uuid,
          name: tag.name,
        })),
        comments: content.comments.map((comment) => ({
          uuid: comment.uuid,
          subject: comment.comment_content,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          commented_by_uuid: comment.user.uuid,
          commented_by: comment.user.full_name,
          profile: comment.user.profile_url,
        })),
        likes: content.likes.map((like) => ({
          uuid: like.uuid,
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
      category_name,
      author,
      pages,
      publication,
      file_url,
      isbn,
      release_date,
      tags,
    } = updateContentDto;

    const content = await this.uuidHelper.validateUuidContent(uuid);
    const category = await this.uuidHelper.validateUuidCategory(category_name);

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

    const ebook = await this.prisma.contents.update({
      where: { uuid, type: 'Ebook' },
      data: {
        title,
        thumbnail,
        description,
        subjects: parsedSubjects,
        category: { connect: { name: category.name } },
        Ebooks: {
          update: {
            where: { content_id: content.id },
            data: { author, pages, publication, file_url, isbn, release_date },
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
      message: 'Ebook succesfully updated.',
      data: {
        uuid: ebook.uuid,
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
        uuid: ebook.uuid,
      },
    };
  }
}
