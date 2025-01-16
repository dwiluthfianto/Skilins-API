import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePrakerinDto } from './dto/create-prakerin.dto';
import { UpdatePrakerinDto } from './dto/update-prakerin.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UuidHelper } from 'src/common/helpers/uuid.helper';
import { SlugHelper } from 'src/common/helpers/generate-unique-slug';
import { ContentStatus, Prisma } from '@prisma/client';
import { subMonths } from 'date-fns';
import { FindPrakerinQueryDto } from '../contents/dto/find-prakerin-query.dto';

@Injectable()
export class PrakerinService {
  constructor(
    private prisma: PrismaService,
    private readonly uuidHelper: UuidHelper,
    private readonly slugHelper: SlugHelper,
  ) {}
  async create(createPrakerinDto: CreatePrakerinDto) {
    const { title, thumbnail, description, pages, file_url, author_uuid } =
      createPrakerinDto;

    const res = await this.prisma.$transaction(async (p) => {
      const newSlug = await this.slugHelper.generateUniqueSlug(title);
      const userData = await p.users.findUniqueOrThrow({
        where: {
          uuid: author_uuid,
        },
        include: {
          Students: {
            select: {
              uuid: true,
            },
          },
        },
      });

      if (!userData) {
        throw new NotFoundException('user not found!');
      }

      const content = await p.contents.create({
        data: {
          type: 'PRAKERIN',
          title,
          thumbnail,
          description,
          slug: newSlug,
          category: { connect: { name: 'Non-fiction' } },
          Prakerin: {
            create: {
              author: { connect: { uuid: userData.Students[0].uuid } },
              pages,
              file_url,
            },
          },
        },
      });

      return {
        status: 'success',
        message: 'prakerin added successfully!',
        data: {
          uuid: content.uuid,
          type: content.type,
        },
      };
    });

    return res;
  }

  async fetchPrakerin(findPrakerinQueryDto: FindPrakerinQueryDto) {
    const { page, limit, search, status, latest } = findPrakerinQueryDto;

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

    const filter = {
      ...searchByTitle,
      ...latestFilter,
      ...statusFilter,
    };

    const prakerin = await this.prisma.contents.findMany({
      ...(page && limit ? { skip: (page - 1) * limit, take: limit } : {}),
      where: {
        type: 'PRAKERIN',
        ...filter,
      },
      include: {
        category: true,
        Tags: true,
        Ratings: true,
        Prakerin: {
          include: {
            author: {
              include: {
                major: true,
              },
            },
          },
        },
      },
    });

    const total = await this.prisma.contents.count({
      where: { type: 'PRAKERIN', ...filter },
    });

    const data = await Promise.all(
      prakerin.map(async (content) => {
        const avgRatingResult = await this.prisma.ratings.aggregate({
          where: { content_id: content.id },
          _avg: {
            rating_value: true,
          },
        });
        const avg_rating = avgRatingResult._avg.rating_value || 0;
        return {
          uuid: content.uuid,
          thumbnail: content.thumbnail,
          title: content.title,
          description: content.description,
          slug: content.slug,
          tags: content.Tags.map((tag) => ({
            id: tag.uuid,
            text: tag.name,
          })),
          status: content.status,
          created_at: content.created_at,
          updated_at: content.updated_at,
          category: content.category.name,
          author: content.Prakerin[0].author.name,
          major: content.Prakerin[0].author.major.name,
          pages: content.Prakerin[0].pages,
          file_url: content.Prakerin[0].file_url,
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

  async fetchUserPrakerin(
    userUuid: string,
    findPrakerinQueryDto: FindPrakerinQueryDto,
  ) {
    const { page, limit, search, status, latest } = findPrakerinQueryDto;

    const user = await this.prisma.users.findUnique({
      where: { uuid: userUuid },
    });

    if (!user) {
      throw new NotFoundException(404, 'Your account has been deleted');
    }

    const currentDate = new Date();

    const twoMonthsAgo = subMonths(currentDate, 2);

    const filterByUser = {
      Prakerin: {
        some: {
          author: {
            user: { uuid: userUuid },
          },
        },
      },
    };

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

    const filter = {
      ...filterByUser,
      ...searchByTitle,
      ...latestFilter,
      ...statusFilter,
    };

    const prakerin = await this.prisma.contents.findMany({
      ...(page && limit ? { skip: (page - 1) * limit, take: limit } : {}),
      where: {
        type: 'PRAKERIN',

        ...filter,
      },
      include: {
        category: true,
        Tags: true,
        Ratings: true,
        Prakerin: {
          include: {
            author: {
              include: {
                major: true,
              },
            },
          },
        },
      },
    });

    const total = await this.prisma.prakerin.count();
    const data = await Promise.all(
      prakerin.map(async (content) => {
        const avgRatingResult = await this.prisma.ratings.aggregate({
          where: { content_id: content.id },
          _avg: {
            rating_value: true,
          },
        });
        const avg_rating = avgRatingResult._avg.rating_value || 0;
        return {
          uuid: content.uuid,
          thumbnail: content.thumbnail,
          title: content.title,
          description: content.description,
          slug: content.slug,
          tags: content.Tags.map((tag) => ({
            id: tag.uuid,
            text: tag.name,
          })),
          status: content.status,
          created_at: content.created_at,
          updated_at: content.updated_at,
          category: content.category.name,
          author: content.Prakerin[0].author.name,
          major: content.Prakerin[0].author.major.name,
          pages: content.Prakerin[0].pages,
          file_url: content.Prakerin[0].file_url,
          avg_rating,
        };
      }),
    );

    return {
      status: 'success',
      data,
      totalPages: limit ? Math.ceil(total / limit) : 1,
      page: page || 1,
      lastPage: limit ? Math.ceil(total / limit) : 1,
    };
  }

  async findOne(uuid: string) {
    await this.uuidHelper.validateUuidContent(uuid);
    const content = await this.prisma.contents.findUniqueOrThrow({
      where: { uuid, type: 'PRAKERIN' },
      include: {
        category: true,
        Genres: true,
        Ratings: true,
        Tags: true,
        Comments: true,
        Prakerin: {
          include: {
            author: {
              include: {
                major: true,
              },
            },
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
        created_at: content.created_at,
        updated_at: content.updated_at,
        category: content.category.name,
        author: content.Prakerin[0].author.name,
        major: content.Prakerin[0].author.major.name,
        pages: content.Prakerin[0].pages,
        file_url: content.Prakerin[0].file_url,
        genres: content.Genres?.map((genre) => ({
          id: genre.uuid,
          text: genre.name,
        })),
        comments: content.Comments?.map((comment) => ({
          uuid: comment.uuid,
          subject: comment.comment_content,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          commented_by: comment.commented_by,
        })),
        avg_rating,
      },
    };
  }

  async findOneBySlug(slug: string) {
    const content = await this.prisma.contents.findUniqueOrThrow({
      where: { slug, type: 'PRAKERIN' },
      include: {
        category: true,
        Genres: true,
        Ratings: true,
        Tags: true,
        Comments: true,
        Prakerin: {
          include: {
            author: {
              include: {
                major: true,
              },
            },
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
        created_at: content.created_at,
        updated_at: content.updated_at,
        category: content.category.name,
        author: content.Prakerin[0].author.name,
        major: content.Prakerin[0].author.major.name,
        pages: content.Prakerin[0].pages,
        file_url: content.Prakerin[0].file_url,
        genres: content.Genres?.map((genre) => ({
          id: genre.uuid,
          text: genre.name,
        })),
        comments: content.Comments?.map((comment) => ({
          uuid: comment.uuid,
          subject: comment.comment_content,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          commented_by: comment.commented_by,
        })),
        avg_rating,
      },
    };
  }

  async update(contentUuid: string, updatePrakerinDto: UpdatePrakerinDto) {
    const { title, thumbnail, description, pages, file_url, author_uuid } =
      updatePrakerinDto;

    const res = await this.prisma.$transaction(async (p) => {
      const contentCheck =
        await this.uuidHelper.validateUuidContent(contentUuid);
      const creator = await this.uuidHelper.validateUuidCreator(author_uuid);

      const newSlug = await this.slugHelper.generateUniqueSlug(title);
      const content = await p.contents.update({
        where: { uuid: contentUuid, type: 'PRAKERIN' },
        data: {
          title,
          thumbnail,
          description,
          slug: newSlug,
          Prakerin: {
            update: {
              where: {
                content_id: contentCheck.id,
              },
              data: {
                author_id: creator.Students[0].id,
                pages,
                file_url,
              },
            },
          },
        },
      });

      return {
        status: 'success',
        message: 'prakerin updated successfully!',
        data: {
          uuid: content.uuid,
        },
      };
    });

    return res;
  }

  async remove(uuid: string) {
    await this.uuidHelper.validateUuidContent(uuid);

    const prakerin = await this.prisma.contents.delete({
      where: { uuid: uuid },
    });
    return {
      status: 'success',
      message: 'prakerin successfully deleted!',
      data: {
        uuid: prakerin.uuid,
      },
    };
  }
}
