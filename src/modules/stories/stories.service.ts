import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateStoryDto } from './dto/create-story.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SlugHelper } from 'src/common/helpers/generate-unique-slug';
import { AddStoryEpisodeDto } from './dto/add-episode-story.dto.ts';
import { UpdateStoryEpisodeDto } from './dto/update-episode-story.dto.ts';
import { UpdateStoryDto } from './dto/update-story.dto';
import { UuidHelper } from 'src/common/helpers/uuid.helper';

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
            author: { connect: { uuid: author_uuid } },
          },
        },
        Genres: {
          connect: parsedGenres?.map((tag) => ({
            name: tag.name,
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
                uuid: true,
              },
            },
          },
        },
      },
    });

    if (content.Stories[0].author.uuid !== authorUuid) {
      throw new ForbiddenException(
        'You do not have permission to delete this episode.',
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

  async getStoryWithEpisodes(storyUuid: string) {
    const content = await this.prisma.contents.findUniqueOrThrow({
      where: { type: 'STORY', uuid: storyUuid },
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
        })),
        genres: content.Genres?.map((genre) => ({
          uuid: genre.uuid,
          name: genre.name,
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

  async getOneEpisode(storyUuid: string, episodeUuid: string) {
    const content = await this.prisma.contents.findUniqueOrThrow({
      where: { type: 'STORY', uuid: storyUuid },
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
              where: {
                uuid: episodeUuid,
              },
              take: 1,
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
        author: content.Stories[0].author.name,
        episode: {
          uuid: content.Stories[0].episodes[0].uuid,
          title: content.Stories[0].episodes[0].title,
          content: content.Stories[0].episodes[0].content,
          order: content.Stories[0].episodes[0].order,
        },
        genres: content.Genres?.map((genre) => ({
          uuid: genre.uuid,
          name: genre.name,
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
