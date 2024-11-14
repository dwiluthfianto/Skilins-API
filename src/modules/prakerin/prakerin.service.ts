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
    const {
      title,
      thumbnail,
      description,
      pages,
      file_url,
      author_uuid,
      category_name,
      tags,
    } = createPrakerinDto;

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
        Tags: {
          connect: parsedTags?.map((tag) => ({
            name: tag.text,
          })),
        },
        category: { connect: { name: category_name } },
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

  async findAll(page: number, limit: number) {
    const contents = await this.prisma.contents.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: { type: 'PRAKERIN' },
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
      contents.map(async (content) => {
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
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findLatest(page: number, limit: number, days: number) {
    const currentDate = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(currentDate.getDate() - days);
    const contents = await this.prisma.contents.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        type: 'PRAKERIN',
        created_at: {
          gte: oneWeekAgo,
          lte: currentDate,
        },
      },
      include: {
        category: true,
        Ratings: true,
        Tags: true,
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
      contents.map(async (content) => {
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
      page,
      lastPage: Math.ceil(total / limit),
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

  async update(contentUuid: string, updatePrakerinDto: UpdatePrakerinDto) {
    const {
      title,
      thumbnail,
      description,
      pages,
      file_url,
      published_at,
      author_uuid,
      category_name,
      tags,
    } = updatePrakerinDto;

    const contentCheck = await this.uuidHelper.validateUuidContent(contentUuid);
    const creator = await this.uuidHelper.validateUuidCreator(author_uuid);
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

    const newSlug = await this.slugHelper.generateUniqueSlug(title);
    const content = await this.prisma.contents.update({
      where: { uuid: contentUuid, type: 'PRAKERIN' },
      data: {
        title,
        thumbnail,
        description,
        slug: newSlug,
        Tags: {
          connect: parsedTags?.map((tag) => ({
            name: tag.text,
          })),
        },
        category: { connect: { id: category.id } },
        Prakerin: {
          update: {
            where: {
              content_id: contentCheck.id,
            },
            data: {
              author_id: creator.id,
              pages,
              file_url,
              published_at,
            },
          },
        },
      },
    });

    return {
      status: 'success',
      message: 'prakerin added successfully!',
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
