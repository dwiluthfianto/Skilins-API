import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateStoryDto } from './dto/create-story.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SlugHelper } from 'src/common/helpers/generate-unique-slug';
import { AddStoryEpisodeDto } from './dto/add-episode-story.dto.ts';
import { UpdateStoryEpisodeDto } from './dto/update-episode-story.dto.ts';
import { UpdateStoryDto } from './dto/update-story.dto';
import { UuidHelper } from 'src/common/helpers/uuid.helper';
import parseArrayInput from 'src/common/utils/parse-array';
import { ContentStatus } from '@prisma/client';

@Injectable()
export class StoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly slugHelper: SlugHelper,
    private readonly uuidHelper: UuidHelper,
  ) {}
  async create(createStoryDto: CreateStoryDto) {
    const {
      title,
      thumbnail,
      description,
      tags,
      category_name,
      genres,
      author_uuid,
    } = createStoryDto;

    const parsedGenres = parseArrayInput(genres);
    const parsedTags = parseArrayInput(tags);

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
    const story = await this.prisma.contents.create({
      data: {
        type: 'STORY',
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
        Stories: {
          create: {
            author: { connect: { uuid: userData.Students[0].uuid } },
          },
        },
        Genres: {
          connect: parsedGenres?.map((tag) => ({
            name: tag.text,
          })),
        },
      },
    });

    return {
      status: 'success',
      message: 'story successfully uploaded!',
      data: {
        uuid: story.uuid,
      },
    };
  }

  async addEpisode(
    storyUuid: string,
    authorUuid: string,
    addStoryEpisodeDto: AddStoryEpisodeDto,
  ) {
    // Cek apakah story ada
    const content = await this.prisma.contents.findUniqueOrThrow({
      where: { type: 'STORY', uuid: storyUuid },
      include: {
        Stories: {
          include: {
            author: {
              select: {
                user: {
                  select: {
                    uuid: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (content.Stories[0].author.user.uuid !== authorUuid) {
      throw new ForbiddenException(
        'You do not have permission to add episode in this story.',
      );
    }

    await this.prisma.episodes.create({
      data: {
        title: addStoryEpisodeDto.title,
        content: addStoryEpisodeDto.content,
        order: addStoryEpisodeDto.order,
        story: { connect: { id: content.Stories[0].id } },
      },
    });

    return {
      status: 'success',
      message: `Episode ${content.title} added successfully`,
      data: {
        uuid: content.uuid,
      },
    };
  }

  async fetchStories(page?: number, limit?: number, filter: object = {}) {
    const stories = await this.prisma.contents.findMany({
      ...(page && limit ? { skip: (page - 1) * limit, take: limit } : {}),
      where: {
        type: 'STORY',
        ...filter,
      },
      include: {
        category: true,
        Tags: true,
        Genres: true,
        Ratings: true,
        Stories: {
          include: {
            author: true,
          },
        },
      },
    });

    const total = await this.prisma.stories.count();

    const data = await Promise.all(
      stories.map(async (story) => {
        const avgRatingResult = await this.prisma.ratings.aggregate({
          where: { content_id: story.id },
          _avg: {
            rating_value: true,
          },
        });
        const avg_rating = avgRatingResult._avg.rating_value || 0;

        return {
          uuid: story.uuid,
          thumbnail: story.thumbnail,
          title: story.title,
          description: story.description,
          slug: story.slug,
          tags: story.Tags.map((tag) => ({
            id: tag.uuid,
            text: tag.name,
          })),
          genres: story.Genres.map((genre) => ({
            id: genre.uuid,
            text: genre.name,
          })),
          status: story.status,
          created_at: story.created_at,
          updated_at: story.updated_at,
          category: story.category.name,
          creator: story.Stories[0]?.author?.name || null,
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
    const { data, total } = await this.fetchStories(page, limit, filter);
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
    const { data, total } = await this.fetchStories(page, limit, filter);
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
    const { data, total } = await this.fetchStories(page, limit, filter);
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
    const { data, total } = await this.fetchStories(page, limit, filter);
    return this.getPaginatedResponse(page, limit, total, data);
  }

  async findUserContent(
    authorUuid: string,
    page: number,
    limit: number,
    status: string = ContentStatus.APPROVED,
  ) {
    const filter = {
      Stories: {
        some: {
          author: {
            user: { uuid: authorUuid },
          },
        },
      },
      status: status as ContentStatus,
    };

    const { data, total } = await this.fetchStories(page, limit, filter);
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
    const { data, total } = await this.fetchStories(page, limit, filter);
    return this.getPaginatedResponse(page, limit, total, data);
  }

  async getStoryBySlug(slug: string) {
    const content = await this.prisma.contents.findUniqueOrThrow({
      where: { type: 'STORY', slug },
      include: {
        category: true,
        Genres: true,
        Ratings: true,
        Comments: true,
        Tags: true,
        Stories: {
          include: {
            author: true,
            episodes: {
              orderBy: { order: 'asc' },
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
        status: content.status,
        tags: content.Tags.map((tag) => ({
          id: tag.uuid,
          text: tag.name,
        })),
        created_at: content.created_at,
        updated_at: content.updated_at,
        category: content.category.name,
        author: content.Stories[0].author.name,
        episodes: content.Stories[0].episodes.map((episode) => ({
          uuid: episode.uuid,
          title: episode.title,
          order: episode.order,
          created_at: episode.created_at,
        })),
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
        avg_rating: avg_rating._avg.rating_value,
      },
    };
  }

  async getOneEpisode(slugStory: string, order: number) {
    const content = await this.prisma.contents.findUniqueOrThrow({
      where: {
        type: 'STORY',
        slug: slugStory,
        Stories: {
          some: {
            episodes: {
              some: {
                order,
              },
            },
          },
        },
      },
      include: {
        Stories: {
          include: {
            author: true,
            episodes: {
              where: {
                order,
              },
            },
          },
        },
      },
    });

    return {
      status: 'success',
      data: {
        uuid: content.Stories[0].episodes[0].uuid,
        title: content.Stories[0].episodes[0].title,
        content: content.Stories[0].episodes[0].content,
        order: content.Stories[0].episodes[0].order,
      },
    };
  }

  async getEpisode(slugStory: string, order: number) {
    const content = await this.prisma.contents.findUniqueOrThrow({
      where: {
        type: 'STORY',
        slug: slugStory,
        Stories: {
          some: {
            episodes: {
              some: {
                order,
              },
            },
          },
        },
      },
      include: {
        category: true,
        Genres: true,
        Ratings: true,
        Comments: true,
        Tags: true,
        Stories: {
          include: {
            author: true,
            episodes: true,
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

    const episodes = content.Stories[0].episodes.sort(
      (a, b) => a.order - b.order,
    );
    const currentEpisodeIndex = episodes.findIndex((ep) => ep.order === order);

    const nextEpisode =
      currentEpisodeIndex + 1 < episodes.length
        ? episodes[currentEpisodeIndex + 1]
        : null;

    const prevEpisode =
      currentEpisodeIndex - 1 >= 0 ? episodes[currentEpisodeIndex - 1] : null;

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
        author: content.Stories[0].author.name,
        episode: {
          uuid: content.Stories[0].episodes[currentEpisodeIndex].uuid,
          title: content.Stories[0].episodes[currentEpisodeIndex].title,
          content: content.Stories[0].episodes[currentEpisodeIndex].content,
          order: content.Stories[0].episodes[currentEpisodeIndex].order,
        },
        nextEpisode: nextEpisode
          ? {
              uuid: nextEpisode.uuid,
              title: nextEpisode.title,
              order: nextEpisode.order,
            }
          : null,
        prevEpisode: prevEpisode
          ? {
              uuid: prevEpisode.uuid,
              title: prevEpisode.title,
              order: prevEpisode.order,
            }
          : null,
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
        avg_rating: avg_rating._avg.rating_value,
      },
    };
  }

  async updateStory(
    contentUuid: string,
    authorUuid: string,
    updateStoryDto: UpdateStoryDto,
  ) {
    const { title, thumbnail, description, tags, category_name, genres } =
      updateStoryDto;

    const content = await this.prisma.contents.findUniqueOrThrow({
      where: { type: 'STORY', uuid: contentUuid },
      include: {
        Stories: {
          include: {
            author: true,
          },
        },
      },
    });
    const category = await this.uuidHelper.validateUuidCategory(category_name);

    if (content.Stories[0].author.uuid !== authorUuid) {
      throw new ForbiddenException(
        'You do not have permission to update this story.',
      );
    }

    let parsedGenres;

    if (Array.isArray(genres)) {
      parsedGenres = genres;
    } else if (typeof genres === 'string') {
      try {
        parsedGenres = JSON.parse(genres);
      } catch (error) {
        console.error('Failed to parse genres:', error);
        throw new Error('Invalid JSON format for genres');
      }
    } else {
      parsedGenres = [];
    }

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
    const story = await this.prisma.contents.update({
      where: { uuid: contentUuid, type: 'STORY' },
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
        category: { connect: { uuid: category.uuid } },
        Genres: {
          connect: parsedGenres?.map((genre) => ({
            name: genre.text,
          })),
        },
      },
    });

    return {
      status: 'success',
      message: 'STORY succesfully updated.',
      data: {
        uuid: story.uuid,
      },
    };
  }
  async updateEpisode(
    episodeUuid: string,
    authorUuid: string,
    updateStoryEpisodeDto: UpdateStoryEpisodeDto,
  ) {
    const episode = await this.prisma.episodes.findUnique({
      where: { uuid: episodeUuid },
      include: {
        story: {
          include: {
            author: {
              include: {
                user: {
                  select: {
                    uuid: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (episode.story.author.user.uuid !== authorUuid) {
      throw new ForbiddenException(
        'You do not have permission to update this episode.',
      );
    }

    await this.prisma.episodes.update({
      where: { uuid: episode.uuid },
      data: {
        title: updateStoryEpisodeDto.title,
        content: updateStoryEpisodeDto.content,
        order: updateStoryEpisodeDto.order,
      },
    });

    return {
      status: 'success',
      message: 'Episode updated successfully',
      data: {
        uuid: episode.uuid,
      },
    };
  }

  async deleteStory(storyUuid: string, authorUuid: string) {
    const story = await this.prisma.contents.findUniqueOrThrow({
      where: { uuid: storyUuid },
      include: {
        Stories: {
          include: {
            author: {
              select: {
                uuid: true,
              },
            },
          },
        },
      },
    });

    if (story.Stories[0].author.uuid !== authorUuid) {
      throw new ForbiddenException(
        'You do not have permission to delete this story.',
      );
    }

    await this.prisma.contents.delete({
      where: { uuid: story.uuid },
    });

    return {
      status: 'success',
      message: 'story deleted succesfully',
      data: {
        uuid: story.uuid,
      },
    };
  }
  async deleteEpisode(episodeUuid: string, authorUuid: string) {
    const episode = await this.prisma.episodes.findUniqueOrThrow({
      where: { uuid: episodeUuid },
      include: {
        story: {
          include: {
            author: {
              select: {
                uuid: true,
              },
            },
          },
        },
      },
    });

    if (episode.story.author.uuid !== authorUuid) {
      throw new ForbiddenException(
        'You do not have permission to delete this episode.',
      );
    }

    await this.prisma.episodes.delete({
      where: { uuid: episode.uuid },
    });

    return {
      status: 'success',
      message: 'story deleted succesfully',
      data: {
        uuid: episode.uuid,
      },
    };
  }
}
