import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVideoPodcastDto } from './dto/create-video-podcast.dto';
import { UpdateVideoPodcastDto } from './dto/update-video-podcast.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UuidHelper } from 'src/common/helpers/uuid.helper';
import { SlugHelper } from 'src/common/helpers/generate-unique-slug';
import parseArrayInput from 'src/common/utils/parse-array';
import { ContentStatus, Prisma } from '@prisma/client';
import { FindContentQueryDto } from '../contents/dto/find-content-query.dto';
import { subMonths } from 'date-fns';

@Injectable()
export class VideoPodcastsService {
  constructor(
    private prisma: PrismaService,
    private readonly uuidHelper: UuidHelper,
    private readonly slugHelper: SlugHelper,
  ) {}
  async create(createVideoPodcastDto: CreateVideoPodcastDto) {
    const {
      title,
      thumbnail,
      description,
      tags,
      category_name,
      file_url,
      creator_uuid,
      genres,
    } = createVideoPodcastDto;

    const res = await this.prisma.$transaction(async (p) => {
      const parsedGenres = parseArrayInput(genres);
      const parsedTags = parseArrayInput(tags);

      const newSlug = await this.slugHelper.generateUniqueSlug(title);
      const userData = await p.users.findUniqueOrThrow({
        where: {
          uuid: creator_uuid,
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
        throw new NotFoundException('User not found!');
      }
      const video = await p.contents.create({
        data: {
          type: 'VIDEO',
          title,
          thumbnail,
          description,
          Tags: {
            connect: parsedTags?.map((tag) => ({
              name: tag.text,
            })),
          },
          slug: newSlug,
          category: { connect: { name: category_name } },
          VideoPodcasts: {
            create: {
              creator: { connect: { uuid: userData.Students[0].uuid } },
              file_url,
            },
          },
          Genres: {
            connect: parsedGenres?.map((genre) => ({
              name: genre.text,
            })),
          },
        },
      });
      return {
        status: 'success',
        message: 'video successfully uploaded!',
        data: {
          uuid: video.uuid,
          type: video.type,
        },
      };
    });

    return res;
  }

  async fetchVideos(findContentQueryDto: FindContentQueryDto) {
    const { page, limit, category, tag, genre, search, status, latest } =
      findContentQueryDto;
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

    const categoryFilter = category
      ? {
          category: {
            name: {
              equals: category,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        }
      : {};

    const genreFilter = genre
      ? {
          Genres: {
            some: {
              name: {
                equals: genre,
                mode: Prisma.QueryMode.insensitive,
              },
            },
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
      ...categoryFilter,
      ...genreFilter,
      ...tagFilter,
    };

    const videos = await this.prisma.contents.findMany({
      ...(page && limit ? { skip: (page - 1) * limit, take: limit } : {}),
      where: {
        type: 'VIDEO',
        ...filter,
      },
      include: {
        category: true,
        Ratings: true,
        Tags: true,
        Genres: true,
        VideoPodcasts: {
          include: {
            creator: true,
          },
        },
      },
    });

    const total = await this.prisma.contents.count({
      where: { type: 'VIDEO', ...filter },
    });

    const data = await Promise.all(
      videos.map(async (video) => {
        const avgRatingResult = await this.prisma.ratings.aggregate({
          where: { content_id: video.id },
          _avg: {
            rating_value: true,
          },
        });
        const avg_rating = avgRatingResult._avg.rating_value || 0;

        return {
          uuid: video.uuid,
          thumbnail: video.thumbnail,
          title: video.title,
          description: video.description,
          slug: video.slug,
          tags: video.Tags.map((tag) => ({
            id: tag.uuid,
            text: tag.name,
          })),
          genres: video.Genres.map((genre) => ({
            id: genre.uuid,
            text: genre.name,
          })),
          created_at: video.created_at,
          updated_at: video.updated_at,
          category: video.category.name,
          creator: video.VideoPodcasts[0].creator.name,
          file_url: video.VideoPodcasts[0].file_url,
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

  async fetchUserVideos(
    userUuid: string,
    findContentQueryDto: FindContentQueryDto,
  ) {
    const { page, limit, category, tag, genre, search, status, latest } =
      findContentQueryDto;

    const user = await this.prisma.users.findUnique({
      where: { uuid: userUuid },
    });

    if (!user) {
      throw new NotFoundException(404, 'Your account has been deleted');
    }

    const currentDate = new Date();

    const twoMonthsAgo = subMonths(currentDate, 2);

    const filterByUser = {
      AudioPodcasts: {
        some: {
          creator: {
            user: { uuid: user.uuid },
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

    const categoryFilter = category
      ? {
          category: {
            name: {
              equals: category,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        }
      : {};

    const genreFilter = genre
      ? {
          Genres: {
            some: {
              name: {
                equals: genre,
                mode: Prisma.QueryMode.insensitive,
              },
            },
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
      ...filterByUser,
      ...searchByTitle,
      ...latestFilter,
      ...statusFilter,
      ...categoryFilter,
      ...genreFilter,
      ...tagFilter,
    };

    const videos = await this.prisma.contents.findMany({
      ...(page && limit ? { skip: (page - 1) * limit, take: limit } : {}),
      where: {
        type: 'VIDEO',
        ...filter,
      },
      include: {
        category: true,
        Ratings: true,
        Tags: true,
        Genres: true,
        VideoPodcasts: {
          include: {
            creator: true,
          },
        },
      },
    });

    const total = await this.prisma.videoPodcasts.count();
    const data = await Promise.all(
      videos.map(async (video) => {
        const avgRatingResult = await this.prisma.ratings.aggregate({
          where: { content_id: video.id },
          _avg: {
            rating_value: true,
          },
        });
        const avg_rating = avgRatingResult._avg.rating_value || 0;

        return {
          uuid: video.uuid,
          thumbnail: video.thumbnail,
          title: video.title,
          description: video.description,
          slug: video.slug,
          tags: video.Tags.map((tag) => ({
            id: tag.uuid,
            text: tag.name,
          })),
          genres: video.Genres.map((genre) => ({
            id: genre.uuid,
            text: genre.name,
          })),
          created_at: video.created_at,
          updated_at: video.updated_at,
          category: video.category.name,
          creator: video.VideoPodcasts[0].creator.name,
          file_url: video.VideoPodcasts[0].file_url,
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
    const video = await this.prisma.contents.findUniqueOrThrow({
      where: { uuid },
      include: {
        category: true,
        Genres: true,
        Ratings: true,
        Comments: true,
        Tags: true,
        VideoPodcasts: {
          include: {
            creator: true,
          },
        },
      },
    });

    const avg_rating = await this.prisma.ratings.aggregate({
      where: { content_id: video.id },
      _avg: {
        rating_value: true,
      },
    });

    return {
      status: 'success',
      data: {
        uuid: video.uuid,
        thumbnail: video.thumbnail,
        title: video.title,
        description: video.description,
        slug: video.slug,
        tags: video.Tags.map((tag) => ({
          id: tag.uuid,
          text: tag.name,
        })),
        created_at: video.created_at,
        updated_at: video.updated_at,
        category: video.category.name,
        creator: video.VideoPodcasts[0].creator.name,
        file_url: video.VideoPodcasts[0].file_url,
        genres: video.Genres.map((genre) => ({
          id: genre.uuid,
          text: genre.name,
        })),
        comments: video.Comments.map((comment) => ({
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
    const video = await this.prisma.contents.findUniqueOrThrow({
      where: { slug },
      include: {
        category: true,
        Genres: true,
        Ratings: true,
        Comments: true,
        Tags: true,
        VideoPodcasts: {
          include: {
            creator: true,
          },
        },
        Submissions: {
          include: {
            competition: {
              select: {
                uuid: true,
              },
            },
          },
        },
      },
    });

    const avg_rating = await this.prisma.ratings.aggregate({
      where: { content_id: video.id },
      _avg: {
        rating_value: true,
      },
    });

    return {
      status: 'success',
      data: {
        uuid: video.uuid,
        thumbnail: video.thumbnail,
        title: video.title,
        description: video.description,
        slug: video.slug,
        tags: video.Tags.map((tag) => ({
          id: tag.uuid,
          text: tag.name,
        })),
        created_at: video.created_at,
        updated_at: video.updated_at,
        category: video.category.name,
        creator: video.VideoPodcasts[0].creator.name,
        file_url: video.VideoPodcasts[0].file_url,
        genres: video.Genres.map((genre) => ({
          id: genre.uuid,
          text: genre.name,
        })),
        comments: video.Comments.map((comment) => ({
          uuid: comment.uuid,
          subject: comment.comment_content,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          commented_by: comment.commented_by,
        })),
        submission_uuid: video.Submissions[0].uuid || '',
        avg_rating: avg_rating._avg.rating_value,
        competition_uuid: video.Submissions[0].competition.uuid,
      },
    };
  }

  async update(uuid: string, updateVideoPodcastDto: UpdateVideoPodcastDto) {
    const {
      title,
      thumbnail,
      description,
      tags,
      category_name,
      file_url,
      creator_uuid,
      genres,
    } = updateVideoPodcastDto;

    const res = await this.prisma.$transaction(async (p) => {
      const content = await this.uuidHelper.validateUuidContent(uuid);
      const creator = await this.uuidHelper.validateUuidCreator(creator_uuid);
      const category =
        await this.uuidHelper.validateUuidCategory(category_name);

      const parsedGenres = parseArrayInput(genres);
      const parsedTags = parseArrayInput(tags);

      const newSlug = await this.slugHelper.generateUniqueSlug(title);
      const video = await p.contents.update({
        where: { uuid, type: 'VIDEO' },
        data: {
          title,
          thumbnail,
          description,
          Tags: {
            connect: parsedTags?.map((tag) => ({
              name: tag.text,
            })),
          },
          category: { connect: { uuid: category.uuid } },
          slug: newSlug,
          VideoPodcasts: {
            update: {
              where: {
                content_id: content.id,
                creator_id: creator.Students[0].id,
              },
              data: {
                file_url,
              },
            },
          },
          Genres: {
            connect: parsedGenres?.map((genre) => ({
              name: genre.text,
            })),
          },
        },
      });
      return {
        status: 'success',
        message: 'video successfully updated!',
        data: {
          uuid: video.uuid,
        },
      };
    });

    return res;
  }

  async remove(uuid: string) {
    await this.uuidHelper.validateUuidContent(uuid);

    const video = await this.prisma.contents.delete({
      where: { uuid },
    });
    return {
      status: 'success',
      message: 'video successfully deleted!',
      data: {
        uuid: video.uuid,
      },
    };
  }
}
