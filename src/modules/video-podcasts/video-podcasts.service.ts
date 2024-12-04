import { Injectable } from '@nestjs/common';
import { CreateVideoPodcastDto } from './dto/create-video-podcast.dto';
import { UpdateVideoPodcastDto } from './dto/update-video-podcast.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UuidHelper } from 'src/common/helpers/uuid.helper';
import { SlugHelper } from 'src/common/helpers/generate-unique-slug';
import parseArrayInput from 'src/common/utils/parse-array';
import { ContentStatus } from '@prisma/client';

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

    const parsedGenres = parseArrayInput(genres);
    const parsedTags = parseArrayInput(tags);

    const newSlug = await this.slugHelper.generateUniqueSlug(title);
    const userData = await this.prisma.users.findUniqueOrThrow({
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
    const video = await this.prisma.contents.create({
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
  }

  async fetchVideos(page?: number, limit?: number, filter: object = {}) {
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
    const { data, total } = await this.fetchVideos(page, limit);
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
    const { data, total } = await this.fetchVideos(page, limit, filter);
    return this.getPaginatedResponse(page, limit, total, data);
  }

  async findByGenre(page: number, limit: number, genre: string) {
    const filter = {
      Genres: {
        name: {
          equals: genre,
          mode: 'insensitive',
        },
      },
    };
    const { data, total } = await this.fetchVideos(page, limit, filter);
    return this.getPaginatedResponse(page, limit, total, data);
  }

  async findByTag(page: number, limit: number, tag: string) {
    const filter = {
      Tags: {
        name: {
          equals: tag,
          mode: 'insensitive',
        },
      },
    };
    const { data, total } = await this.fetchVideos(page, limit, filter);
    return this.getPaginatedResponse(page, limit, total, data);
  }

  async findUserContent(
    authorUuid: string,
    page: number,
    limit: number,
    status: string = ContentStatus.APPROVED,
  ) {
    const filter = {
      VideoPodcasts: {
        some: {
          creator: {
            user: { uuid: authorUuid },
          },
        },
      },
      status: status as ContentStatus,
    };

    const { data, total } = await this.fetchVideos(page, limit, filter);
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

    const { data, total } = await this.fetchVideos(page, limit, filter);
    return this.getPaginatedResponse(page, limit, total, data);
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
          select: {
            uuid: true,
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

    const content = await this.uuidHelper.validateUuidContent(uuid);
    const creator = await this.uuidHelper.validateUuidCreator(creator_uuid);
    const category = await this.uuidHelper.validateUuidCategory(category_name);

    const parsedGenres = parseArrayInput(genres);
    const parsedTags = parseArrayInput(tags);

    const newSlug = await this.slugHelper.generateUniqueSlug(title);
    const video = await this.prisma.contents.update({
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
