import { Injectable } from '@nestjs/common';
import { CreateAudioPodcastDto } from './dto/create-audio-podcast.dto';
import { UpdateAudioPodcastDto } from './dto/update-audio-podcast.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UuidHelper } from 'src/common/helpers/uuid.helper';
import { SlugHelper } from 'src/common/helpers/generate-unique-slug';
import parseArrayInput from 'src/common/utils/parse-array';
import { ContentStatus } from '@prisma/client';

@Injectable()
export class AudioPodcastsService {
  constructor(
    private prisma: PrismaService,
    private readonly uuidHelper: UuidHelper,
    private readonly slugHelper: SlugHelper,
  ) {}

  async create(createAudioPodcastDto: CreateAudioPodcastDto) {
    const {
      title,
      thumbnail,
      description,
      tags,
      category_name,
      duration,
      file_url,
      creator_uuid,
      genres,
    } = createAudioPodcastDto;

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
    const audio = await this.prisma.contents.create({
      data: {
        type: 'AUDIO',
        title,
        thumbnail,
        description,
        Tags: {
          connect: parsedTags?.map((tag) => ({
            name: tag.text,
          })),
        },
        category: { connect: { name: category_name } },
        slug: newSlug,
        AudioPodcasts: {
          create: {
            creator: { connect: { uuid: userData.Students[0].uuid } },
            duration,
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
      message: 'audio successfully uploaded!',
      data: {
        uuid: audio.uuid,
        type: audio.type,
      },
    };
  }

  async fetchAudios(page?: number, limit?: number, filter: object = {}) {
    const audios = await this.prisma.contents.findMany({
      ...(page && limit ? { skip: (page - 1) * limit, take: limit } : {}),
      where: {
        type: 'AUDIO',
        ...filter,
      },
      include: {
        category: true,
        Tags: true,
        Genres: true,
        Ratings: true,
        AudioPodcasts: {
          include: {
            creator: true,
          },
        },
      },
    });

    const total = await this.prisma.audioPodcasts.count();

    const data = await Promise.all(
      audios.map(async (audio) => {
        const avgRatingResult = await this.prisma.ratings.aggregate({
          where: { content_id: audio.id },
          _avg: {
            rating_value: true,
          },
        });
        const avg_rating = avgRatingResult._avg.rating_value || 0;

        return {
          uuid: audio.uuid,
          thumbnail: audio.thumbnail,
          title: audio.title,
          description: audio.description,
          slug: audio.slug,
          tags: audio.Tags.map((tag) => ({
            id: tag.uuid,
            text: tag.name,
          })),
          genres: audio.Genres.map((genre) => ({
            id: genre.uuid,
            text: genre.name,
          })),
          status: audio.status,
          created_at: audio.created_at,
          updated_at: audio.updated_at,
          category: audio.category.name,
          creator: audio.AudioPodcasts[0]?.creator?.name || null,
          duration: audio.AudioPodcasts[0]?.duration || null,
          file_url: audio.AudioPodcasts[0]?.file_url || null,
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

  async findAll(page?: number, limit?: number, search: string = '') {
    const filter = {
      title: {
        contains: search,
        mode: 'insensitive',
      },
    };
    const { data, total } = await this.fetchAudios(page, limit, filter);
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
    const { data, total } = await this.fetchAudios(page, limit, filter);
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
    const { data, total } = await this.fetchAudios(page, limit, filter);
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
    const { data, total } = await this.fetchAudios(page, limit, filter);
    return this.getPaginatedResponse(page, limit, total, data);
  }

  async findUserContent(
    authorUuid: string,
    page: number,
    limit: number,
    status: string = ContentStatus.APPROVED,
  ) {
    const filter = {
      AudioPodcasts: {
        some: {
          creator: {
            user: { uuid: authorUuid },
          },
        },
      },
      status: status as ContentStatus,
    };

    const { data, total } = await this.fetchAudios(page, limit, filter);
    return this.getPaginatedResponse(page, limit, total, data);
  }

  async findLatest(
    page: number,
    limit: number,
    week: number,
    status: string = ContentStatus.APPROVED,
  ) {
    const currentDate = new Date();
    const weeks = week * 7;
    const oneWeekAgo = new Date(
      currentDate.getTime() - weeks * 24 * 60 * 60 * 1000,
    );

    const filter = {
      status: status as ContentStatus,
      created_at: {
        gte: oneWeekAgo,
        lte: currentDate,
      },
    };
    const { data, total } = await this.fetchAudios(page, limit, filter);
    return this.getPaginatedResponse(page, limit, total, data);
  }

  async findOne(uuid: string) {
    const audio = await this.prisma.contents.findUniqueOrThrow({
      where: { uuid },
      include: {
        category: true,
        Genres: true,
        Ratings: true,
        Tags: true,
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
        AudioPodcasts: {
          include: {
            creator: true,
          },
        },
      },
    });

    const avg_rating = await this.prisma.ratings.aggregate({
      where: { content_id: audio.id },
      _avg: {
        rating_value: true,
      },
    });

    return {
      status: 'success',
      data: {
        uuid: audio.uuid,
        thumbnail: audio.thumbnail,
        title: audio.title,
        status: audio.status,
        description: audio.description,
        slug: audio.slug,
        tags: audio.Tags.map((tag) => ({
          id: tag.uuid,
          text: tag.name,
        })),
        created_at: audio.created_at,
        updated_at: audio.updated_at,
        category: audio.category.name,
        creator: audio.AudioPodcasts[0].creator.name,
        duration: audio.AudioPodcasts[0].duration,
        file_url: audio.AudioPodcasts[0].file_url,
        genres: audio.Genres?.map((genre) => ({
          id: genre.uuid,
          text: genre.name,
        })),
        comments: audio.Comments.map((comment) => ({
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
    const audio = await this.prisma.contents.findUniqueOrThrow({
      where: { slug },
      include: {
        category: true,
        Genres: true,
        Ratings: true,
        Tags: true,
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
        AudioPodcasts: {
          include: {
            creator: true,
          },
        },
      },
    });

    const avg_rating = await this.prisma.ratings.aggregate({
      where: { content_id: audio.id },
      _avg: {
        rating_value: true,
      },
    });

    return {
      status: 'success',
      data: {
        uuid: audio.uuid,
        thumbnail: audio.thumbnail,
        title: audio.title,
        status: audio.status,
        description: audio.description,
        slug: audio.slug,
        tags: audio.Tags.map((tag) => ({
          id: tag.uuid,
          text: tag.name,
        })),
        created_at: audio.created_at,
        updated_at: audio.updated_at,
        category: audio.category.name,
        creator: audio.AudioPodcasts[0].creator.name,
        duration: audio.AudioPodcasts[0].duration,
        file_url: audio.AudioPodcasts[0].file_url,
        genres: audio.Genres?.map((genre) => ({
          id: genre.uuid,
          text: genre.name,
        })),
        ratings: audio.Ratings.map((rating) => ({
          uuid: rating.uuid,
          created_at: rating.created_at,
          rating_value: rating.rating_value,
          rating_by: rating.rating_by,
        })),
        comments: audio.Comments.map((comment) => ({
          uuid: comment.uuid,
          subject: comment.comment_content,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          commented_by_uuid: comment.user.uuid,
          commented_by: comment.user.full_name,
          profile: comment.user.profile_url,
        })),
        avg_rating: avg_rating._avg.rating_value,
      },
    };
  }

  async update(uuid: string, updateAudioPodcastDto: UpdateAudioPodcastDto) {
    const {
      title,
      thumbnail,
      description,
      tags,
      category_name,
      duration,
      file_url,
      creator_uuid,
      genres,
    } = updateAudioPodcastDto;

    const content = await this.uuidHelper.validateUuidContent(uuid);
    const category = await this.uuidHelper.validateUuidCategory(category_name);
    const creator = await this.uuidHelper.validateUuidCreator(creator_uuid);

    const parsedGenres = parseArrayInput(genres);
    const parsedTags = parseArrayInput(tags);

    const slug = await this.slugHelper.generateUniqueSlug(title);

    const audio = await this.prisma.contents.update({
      where: { uuid: uuid, type: 'AUDIO' },
      data: {
        title,
        thumbnail,
        description,
        Tags: {
          connect: parsedTags?.map((tag) => ({
            name: tag.text,
          })),
        },
        slug,
        category: { connect: { uuid: category.uuid } },
        AudioPodcasts: {
          update: {
            where: {
              content_id: content.id,
              creator_id: creator.Students[0].id,
            },
            data: {
              duration: duration || 0,
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
      message: 'audio successfully updated!',
      data: {
        uuid: audio.uuid,
      },
    };
  }

  async remove(uuid: string) {
    await this.uuidHelper.validateUuidContent(uuid);

    const audio = await this.prisma.contents.delete({
      where: { uuid: uuid },
    });
    return {
      status: 'success',
      message: 'audio successfully deleted!',
      data: {
        uuid: audio.uuid,
      },
    };
  }
}
