import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UuidHelper } from 'src/common/helpers/uuid.helper';
import { SlugHelper } from 'src/common/helpers/generate-unique-slug';
import { ContentStatus, Prisma } from '@prisma/client';
import parseArrayInput from 'src/common/utils/parse-array';
import { subMonths } from 'date-fns';
import { FindBlogQueryDto } from '../contents/dto/find-blog-query.dto';

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

    const parsedTags = parseArrayInput(tags);

    const newSlug = await this.slugHelper.generateUniqueSlug(title);
    const content = await this.prisma.contents.create({
      data: {
        type: 'BLOG',
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

  async fetchBlogs(findBlogQueryDto: FindBlogQueryDto) {
    const { page, limit, tag, search, status, latest } = findBlogQueryDto;

    const currentDate = new Date();

    const twoMonthsAgo = subMonths(currentDate, 2);

    const latestFilter = latest
      ? {
          status: ContentStatus.APPROVED,
          created_at: {
            gte: twoMonthsAgo,
            lte: currentDate,
          },
        }
      : {};

    const searchByTitle = {
      title: {
        contains: search,
        mode: Prisma.QueryMode.insensitive,
      },
    };

    const statusFilter = status
      ? {
          status: {
            equals: status,
          },
        }
      : {};

    const tagFilter = tag
      ? {
          Tags: {
            some: {
              name: {
                equals: tag,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          },
        }
      : {};

    const filter = {
      ...searchByTitle,
      ...latestFilter,
      ...statusFilter,
      ...tagFilter,
    };

    const blogs = await this.prisma.contents.findMany({
      ...(page && limit ? { skip: (page - 1) * limit, take: limit } : {}),
      where: {
        type: 'BLOG',
        ...filter,
      },
      include: {
        category: true,
        Tags: true,
        Ratings: true,
        Blogs: {
          include: {
            author: true,
          },
        },
      },
    });

    const total = await this.prisma.contents.count({
      where: { type: 'BLOG', ...filter },
    });

    const data = await Promise.all(
      blogs.map(async (blog) => {
        const avgRatingResult = await this.prisma.ratings.aggregate({
          where: { content_id: blog.id },
          _avg: {
            rating_value: true,
          },
        });
        const avg_rating = avgRatingResult._avg.rating_value || 0;

        return {
          uuid: blog.uuid,
          thumbnail: blog.thumbnail,
          title: blog.title,
          description: blog.description,
          slug: blog.slug,
          tags: blog.Tags.map((tag) => ({
            id: tag.uuid,
            text: tag.name,
          })),
          updated_at: blog.updated_at,
          category: blog.category.name,
          author: blog.Blogs[0].author.full_name,
          avg_rating,
        };
      }),
    );

    return {
      status: 'success',
      data,
      totalPages: total,
      page: page || 1,
      lastPage: limit ? Math.ceil(total / limit) : 1,
    };
  }

  async findOneByUuid(uuid: string) {
    const content = await this.prisma.contents.findUniqueOrThrow({
      where: { type: 'BLOG', uuid },
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
      where: { type: 'BLOG', slug },
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

    const parsedTags = parseArrayInput(tags);
    const newSlug = await this.slugHelper.generateUniqueSlug(title);

    const blog = await this.prisma.contents.update({
      where: {
        uuid: content.uuid,
        type: 'BLOG',
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
      where: { uuid: uuid, type: 'BLOG' },
    });
    return {
      status: 'success',
      message: 'Blog succefully deleted',
      data: { uuid: content.uuid },
    };
  }
}
