import { Injectable } from '@nestjs/common';
import { CreatePrakerinDto } from './dto/create-prakerin.dto';
import { UpdatePrakerinDto } from './dto/update-prakerin.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UuidHelper } from 'src/common/helpers/uuid.helper';
import { SlugHelper } from 'src/common/helpers/generate-unique-slug';

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

    const newSlug = await this.slugHelper.generateUniqueSlug(title);
    const userData = await this.prisma.users.findUniqueOrThrow({
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
    const content = await this.prisma.contents.create({
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
  }

  async fetchPrakerin(page: number, limit: number, filter: object = {}) {
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

    return { data, total };
  }

  async getPaginatedResponse(
    page: number,
    limit: number,
    total: number,
    data: any[],
  ) {
    return {
      status: 'success',
      data,
      totalPages: limit ? Math.ceil(total / limit) : 1,
      page: page || 1,
      lastPage: limit ? Math.ceil(total / limit) : 1,
    };
  }

  async findAll(page?: number, limit?: number) {
    const { data, total } = await this.fetchPrakerin(page, limit);

    return this.getPaginatedResponse(page, limit, total, data);
  }

  async findByCategory(page: number, limit: number, category: string) {
    const filter = {
      category: {
        name: {
          equals: category,
          mode: 'insensitive',
        },
      },
    };
    const { data, total } = await this.fetchPrakerin(page, limit, filter);
    return this.getPaginatedResponse(page, limit, total, data);
  }

  async findByGenre(page: number, limit: number, genre: string) {
    const filter = {
      Genres: {
        some: {
          name: {
            equals: genre,
            mode: 'insensitive',
          },
        },
      },
    };
    const { data, total } = await this.fetchPrakerin(page, limit, filter);
    return this.getPaginatedResponse(page, limit, total, data);
  }

  async findByTag(page: number, limit: number, tag: string) {
    const filter = {
      Tags: {
        some: {
          name: {
            equals: tag,
            mode: 'insensitive',
          },
        },
      },
    };
    const { data, total } = await this.fetchPrakerin(page, limit, filter);
    return this.getPaginatedResponse(page, limit, total, data);
  }

  async findUserContent(authorUuid: string, page: number, limit: number) {
    const filter = {
      Prakerin: {
        some: {
          author: {
            user: { uuid: authorUuid },
          },
        },
      },
    };

    const { data, total } = await this.fetchPrakerin(page, limit, filter);
    return this.getPaginatedResponse(page, limit, total, data);
  }

  async findLatest(page: number, limit: number, week: number) {
    const currentDate = new Date();
    const weeks = week * 7;
    const oneWeekAgo = new Date(
      currentDate.getTime() - weeks * 24 * 60 * 60 * 1000,
    );

    const filter = {
      created_at: {
        gte: oneWeekAgo,
        lte: currentDate,
      },
    };
    const { data, total } = await this.fetchPrakerin(page, limit, filter);
    return this.getPaginatedResponse(page, limit, total, data);
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

    const contentCheck = await this.uuidHelper.validateUuidContent(contentUuid);
    const creator = await this.uuidHelper.validateUuidCreator(author_uuid);

    const newSlug = await this.slugHelper.generateUniqueSlug(title);
    const content = await this.prisma.contents.update({
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
