import { Injectable } from '@nestjs/common';
import { CreateVideoPodcastDto } from './dto/create-video-podcast.dto';
import { UpdateVideoPodcastDto } from './dto/update-video-podcast.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UuidHelper } from 'src/common/helpers/uuid.helper';
import { SlugHelper } from 'src/common/helpers/generate-unique-slug';

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
      duration,
      file_url,
      creator_uuid,
      genres,
    } = createVideoPodcastDto;

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
    const video = await this.prisma.contents.create({
      data: {
        type: 'VideoPodcast',
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
            creator: { connect: { uuid: creator_uuid } },
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
      message: 'video successfully uploaded!',
      data: {
        uuid: video.uuid,
      },
    };
  }

  async findAll(page: number, limit: number) {
    const videos = await this.prisma.contents.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: { type: 'VideoPodcast' },
      include: {
        category: true,
        Ratings: true,
        Tags: true,
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
        // Calculate average rating for each content
        const avgRatingResult = await this.prisma.ratings.aggregate({
          where: { content_id: video.id },
          _avg: {
            rating_value: true,
          },
        });
        const avg_rating = avgRatingResult._avg.rating_value || 0; // Default to 0 if no ratings

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
          created_at: video.created_at,
          updated_at: video.updated_at,
          category: video.category.name,
          creator: video.VideoPodcasts[0].creator.name,
          duration: video.VideoPodcasts[0].duration,
          file_url: video.VideoPodcasts[0].file_url,
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
  async findByCategory(page: number, limit: number, category: string) {
    const videos = await this.prisma.contents.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        type: 'VideoPodcast',
        category: {
          name: {
            equals: category,
            mode: 'insensitive',
          },
        },
      },
      include: {
        category: true,
        Ratings: true,
        Tags: true,
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
        // Calculate average rating for each content
        const avgRatingResult = await this.prisma.ratings.aggregate({
          where: { content_id: video.id },
          _avg: {
            rating_value: true,
          },
        });
        const avg_rating = avgRatingResult._avg.rating_value || 0; // Default to 0 if no ratings

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
          created_at: video.created_at,
          updated_at: video.updated_at,
          category: video.category.name,
          creator: video.VideoPodcasts[0].creator.name,
          duration: video.VideoPodcasts[0].duration,
          file_url: video.VideoPodcasts[0].file_url,
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

  async findByTag(page: number, limit: number, genre: string) {
    const videos = await this.prisma.contents.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        type: 'VideoPodcast',
        Genres: {
          some: {
            name: {
              equals: genre,
              mode: 'insensitive',
            },
          },
        },
      },
      include: {
        category: true,
        Ratings: true,
        Tags: true,
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
        // Calculate average rating for each content
        const avgRatingResult = await this.prisma.ratings.aggregate({
          where: { content_id: video.id },
          _avg: {
            rating_value: true,
          },
        });
        const avg_rating = avgRatingResult._avg.rating_value || 0; // Default to 0 if no ratings

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
          created_at: video.created_at,
          updated_at: video.updated_at,
          category: video.category.name,
          creator: video.VideoPodcasts[0].creator.name,
          duration: video.VideoPodcasts[0].duration,
          file_url: video.VideoPodcasts[0].file_url,
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
  async findLatest(page: number, limit: number, week: number) {
    const currentDate = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(currentDate.getDate() - week * 7);
    const videos = await this.prisma.contents.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        type: 'VideoPodcast',
        created_at: {
          gte: oneWeekAgo,
          lte: currentDate,
        },
      },
      include: {
        category: true,
        Ratings: true,
        Tags: true,
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
        // Calculate average rating for each content
        const avgRatingResult = await this.prisma.ratings.aggregate({
          where: { content_id: video.id },
          _avg: {
            rating_value: true,
          },
        });
        const avg_rating = avgRatingResult._avg.rating_value || 0; // Default to 0 if no ratings

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
          created_at: video.created_at,
          updated_at: video.updated_at,
          category: video.category.name,
          creator: video.VideoPodcasts[0].creator.name,
          duration: video.VideoPodcasts[0].duration,
          file_url: video.VideoPodcasts[0].file_url,
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
        duration: video.VideoPodcasts[0].duration,
        file_url: video.VideoPodcasts[0].file_url,
        genres: video.Genres.map((genre) => ({
          uuid: genre.uuid,
          name: genre.name,
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

  async update(uuid: string, updateVideoPodcastDto: UpdateVideoPodcastDto) {
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
    } = updateVideoPodcastDto;

    const content = await this.uuidHelper.validateUuidContent(uuid);
    const creator = await this.uuidHelper.validateUuidCreator(creator_uuid);
    const category = await this.uuidHelper.validateUuidCategory(category_name);

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
    const video = await this.prisma.contents.update({
      where: { uuid, type: 'VideoPodcast' },
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
            where: { content_id: content.id },
            data: {
              creator_id: creator.id,
              duration,
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
