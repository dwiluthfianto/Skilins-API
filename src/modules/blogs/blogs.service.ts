import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UuidHelper } from 'src/common/helpers/uuid.helper';
import { SlugHelper } from 'src/common/helpers/generate-unique-slug';
import { ContentStatus } from '@prisma/client';

@Injectable()
export class BlogsService {
  constructor(
    private prisma: PrismaService,
    private readonly uuidHelper: UuidHelper,
    private readonly slugHelper: SlugHelper,
  ) {}

  async create(authorUuid: string, createBlogDto: CreateBlogDto) {
    const { title, thumbnail, description, tags, category_name } =
      createBlogDto;

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

    const newSlug = await this.slugHelper.generateUniqueSlug(title);
    const content = await this.prisma.contents.create({
      data: {
        type: 'Blog',
        title,
        thumbnail,
        description,
        status: ContentStatus.APPROVED,
        Tags: {
          connect: parsedTags?.map((tag) => ({
            name: tag.text,
          })),
        },
        slug: newSlug,
        category: {
          connect: {
            name: category_name,
          },
        },
        Blogs: {
          create: {
            author: { connect: { uuid: authorUuid } },
          },
        },
      },
    });

    return {
      status: 'success',
      message: 'Blog succefully added',
      data: {
        id: content.uuid,
      },
    };
  }

  async findAll(page: number, limit: number) {
    const contents = await this.prisma.contents.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: { type: 'Blog' },
      include: {
        category: true,
        Tags: true,
        Blogs: {
          include: {
            author: true,
          },
        },
      },
    });

    const total = await this.prisma.blogs.count();

    return {
      status: 'success',
      data: contents.map((content) => ({
        uuid: content.uuid,
        thumbnail: content.thumbnail,
        title: content.title,
        description: content.description,
        slug: content.slug,
        tags: content.Tags.map((tag) => ({
          id: tag.uuid,
          text: tag.name,
        })),
        updated_at: content.updated_at,
        category: content.category.name,
        author: content.Blogs[0].author.full_name,
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
        Tags: true,
        Blogs: {
          include: {
            author: true,
          },
        },
      },
    });

    const total = await this.prisma.blogs.count();

    return {
      status: 'success',
      data: contents.map((content) => ({
        uuid: content.uuid,
        thumbnail: content.thumbnail,
        title: content.title,
        description: content.description,
        slug: content.slug,
        tags: content.Tags.map((tag) => ({
          id: tag.uuid,
          text: tag.name,
        })),
        updated_at: content.updated_at,
        category: content.category.name,
        author: content.Blogs[0].author.full_name,
      })),
      totalPages: total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findByGenre(page: number, limit: number, tag: string) {
    const contents = await this.prisma.contents.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        type: 'Ebook',
        Genres: {
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
        Tags: true,
        Blogs: {
          include: {
            author: true,
          },
        },
      },
    });

    const total = await this.prisma.blogs.count();

    return {
      status: 'success',
      data: contents.map((content) => ({
        uuid: content.uuid,
        thumbnail: content.thumbnail,
        title: content.title,
        description: content.description,
        slug: content.slug,
        tags: content.Tags.map((tag) => ({
          id: tag.uuid,
          text: tag.name,
        })),
        updated_at: content.updated_at,
        category: content.category.name,
        author: content.Blogs[0].author.full_name,
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
        Tags: true,
        Blogs: {
          include: {
            author: true,
          },
        },
      },
    });

    const total = await this.prisma.blogs.count();
    return {
      status: 'success',
      data: contents.map((content) => ({
        uuid: content.uuid,
        thumbnail: content.thumbnail,
        title: content.title,
        description: content.description,
        slug: content.slug,
        tags: content.Tags.map((tag) => ({
          id: tag.uuid,
          text: tag.name,
        })),
        updated_at: content.updated_at,
        category: content.category.name,
        author: content.Blogs[0].author.full_name,
      })),
      totalPages: total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOneByUuid(uuid: string) {
    const content = await this.prisma.contents.findUniqueOrThrow({
      where: { type: 'Blog', uuid },
      include: {
        category: true,
        Tags: true,
        Genres: true,
        Comments: {
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
        Blogs: {
          include: {
            author: true,
          },
        },
      },
    });

    const avg_rating = await this.prisma.ratings.aggregate({
      where: { content_id: content.id },
      _avg: {
        rating_value: true,
      },
    });

    return {
      status: 'success',
      data: {
        uuid: content.uuid,
        thumbnail: content.thumbnail,
        title: content.title,
        description: content.description,
        slug: content.slug,
        tags: content.Tags.map((tag) => ({
          id: tag.uuid,
          text: tag.name,
        })),
        updated_at: content.updated_at,
        category: content.category.name,
        author: content.Blogs[0].author.full_name,
        genres: content.Genres.map((genre) => ({
          id: genre.uuid,
          text: genre.name,
        })),
        comments: content.Comments.map((comment) => ({
          uuid: comment.uuid,
          subject: comment.comment_content,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          commented_by_uuid: comment.user.uuid,
          commented_by: comment.user.full_name,
          profile: comment.user.profile_url,
        })),
        avg_rating,
      },
    };
  }
  async findOneBySlug(slug: string) {
    const content = await this.prisma.contents.findUniqueOrThrow({
      where: { type: 'Blog', slug },
      include: {
        Tags: true,
        category: true,
        Genres: true,
        Comments: {
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
        Blogs: {
          include: {
            author: true,
          },
        },
      },
    });

    const avg_rating = await this.prisma.ratings.aggregate({
      where: { content_id: content.id },
      _avg: {
        rating_value: true,
      },
    });

    return {
      status: 'success',
      data: {
        uuid: content.uuid,
        thumbnail: content.thumbnail,
        title: content.title,
        description: content.description,
        slug: content.slug,
        tags: content.Tags.map((tag) => ({
          id: tag.uuid,
          text: tag.name,
        })),
        updated_at: content.updated_at,
        category: content.category.name,
        author: content.Blogs[0].author.full_name,
        genres: content.Genres.map((genre) => ({
          id: genre.uuid,
          text: genre.name,
        })),
        comments: content.Comments.map((comment) => ({
          uuid: comment.uuid,
          subject: comment.comment_content,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          commented_by_uuid: comment.user.uuid,
          commented_by: comment.user.full_name,
          profile: comment.user.profile_url,
        })),
        avg_rating,
      },
    };
  }

  async update(
    authorUuid: string,
    contentUuid: string,
    updateBlogDto: UpdateBlogDto,
  ) {
    const { title, thumbnail, description, tags, category_name } =
      updateBlogDto;

    const content = await this.uuidHelper.validateUuidContent(contentUuid);

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
    const newSlug = await this.slugHelper.generateUniqueSlug(title);

    const blog = await this.prisma.contents.update({
      where: {
        uuid: content.uuid,
        type: 'Blog',
      },
      data: {
        title,
        thumbnail,
        description,
        Tags: {
          connect: parsedTags?.map((tag) => ({
            name: tag.text,
          })),
        },
        slug: newSlug,
        category: {
          connect: {
            name: category_name,
          },
        },
        Blogs: {
          update: {
            where: { content_id: content.id },
            data: {
              author: { connect: { uuid: authorUuid } },
            },
          },
        },
      },
    });

    return {
      status: 'success',
      message: 'Blog updated successfully',
      data: {
        id: blog.uuid,
      },
    };
  }

  async remove(uuid: string) {
    const isExists = await this.prisma.contents.findUnique({
      where: { uuid },
    });

    if (!isExists) {
      throw new NotFoundException(`Audio with UUID ${uuid} does not exist`);
    }

    const content = await this.prisma.contents.delete({
      where: { uuid: uuid, type: 'Blog' },
    });
    return {
      status: 'success',
      message: 'Blog succefully deleted',
      data: { uuid: content.uuid },
    };
  }
}
