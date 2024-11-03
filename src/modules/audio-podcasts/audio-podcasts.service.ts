import { Injectable } from '@nestjs/common';
import { CreateAudioPodcastDto } from './dto/create-audio-podcast.dto';
import { UpdateAudioPodcastDto } from './dto/update-audio-podcast.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UuidHelper } from 'src/common/helpers/uuid.helper';
import { SlugHelper } from 'src/common/helpers/generate-unique-slug';

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
      subjects,
      category_name,
      duration,
      file_url,
      creator_uuid,
      genres,
    } = createAudioPodcastDto;

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

    let parsedSubjects;
    if (Array.isArray(subjects)) {
      parsedSubjects = subjects;
    } else if (typeof subjects === 'string') {
      try {
        parsedSubjects = JSON.parse(subjects);
      } catch (error) {
        console.error('Failed to parse subjects:', error);
        throw new Error('Invalid JSON format for subjects');
      }
    } else {
      parsedSubjects = [];
    }
    const slug = await this.slugHelper.generateUniqueSlug(title);
    const audio = await this.prisma.contents.create({
      data: {
        type: 'AudioPodcast',
        title,
        thumbnail,
        description,
        subjects: parsedSubjects,
        category: { connect: { name: category_name } },
        slug,
        AudioPodcasts: {
          create: {
            creator: { connect: { uuid: creator_uuid } },
            duration: duration,
            file_url,
          },
        },
        Genres: {
          connectOrCreate: parsedGenres?.map((genre) => ({
            where: { name: genre.name },
            create: {
              name: genre.name,
              avatar_url:
                genre.avatar_url ||
                'https://images.unsplash.com/photo-1494537176433-7a3c4ef2046f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
              description: genre.description || 'No description available.',
            },
          })),
        },
      },
    });
    return {
      status: 'success',
      message: 'audio successfully uploaded!',
      data: {
        uuid: audio.uuid,
      },
    };
  }

  async findAll(page: number, limit: number) {
    const audios = await this.prisma.contents.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: { type: 'AudioPodcast' },
      include: {
        category: true,
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
          subjects: audio.subjects,
          created_at: audio.created_at,
          updated_at: audio.updated_at,
          category: audio.category.name,
          creator: audio.AudioPodcasts[0].creator.name,
          duration: audio.AudioPodcasts[0].duration,
          file_url: audio.AudioPodcasts[0].file_url,
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
    const audios = await this.prisma.contents.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        type: 'AudioPodcast',
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
          subjects: audio.subjects,
          created_at: audio.created_at,
          updated_at: audio.updated_at,
          category: audio.category.name,
          creator: audio.AudioPodcasts[0].creator.name,
          duration: audio.AudioPodcasts[0].duration,
          file_url: audio.AudioPodcasts[0].file_url,
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
    const audios = await this.prisma.contents.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        type: 'AudioPodcast',
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
          subjects: audio.subjects,
          created_at: audio.created_at,
          updated_at: audio.updated_at,
          category: audio.category.name,
          creator: audio.AudioPodcasts[0].creator.name,
          duration: audio.AudioPodcasts[0].duration,
          file_url: audio.AudioPodcasts[0].file_url,
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
    const weeks = week * 7;

    oneWeekAgo.setDate(currentDate.getDate() - weeks);
    const audios = await this.prisma.contents.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        type: 'AudioPodcast',
        created_at: {
          gte: oneWeekAgo,
          lte: currentDate,
        },
      },
      include: {
        category: true,
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
          subjects: audio.subjects,
          created_at: audio.created_at,
          updated_at: audio.updated_at,
          category: audio.category.name,
          creator: audio.AudioPodcasts[0].creator.name,
          duration: audio.AudioPodcasts[0].duration,
          file_url: audio.AudioPodcasts[0].file_url,
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
    const audio = await this.prisma.contents.findUniqueOrThrow({
      where: { uuid },
      include: {
        category: true,
        Genres: true,
        Ratings: true,
        Comments: true,
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
        description: audio.description,
        subjects: audio.subjects,
        created_at: audio.created_at,
        updated_at: audio.updated_at,
        category: audio.category.name,
        creator: audio.AudioPodcasts[0].creator.name,
        duration: audio.AudioPodcasts[0].duration,
        file_url: audio.AudioPodcasts[0].file_url,
        genres: audio.Genres?.map((genre) => ({
          uuid: genre.uuid,
          name: genre.name,
        })),
        comments: audio.Comments?.map((comment) => ({
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

  async update(uuid: string, updateAudioPodcastDto: UpdateAudioPodcastDto) {
    const {
      title,
      thumbnail,
      description,
      subjects,
      category_name,
      duration,
      file_url,
      creator_uuid,
      genres,
    } = updateAudioPodcastDto;

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

    let parsedSubjects;
    if (Array.isArray(subjects)) {
      parsedSubjects = subjects;
    } else if (typeof subjects === 'string') {
      try {
        parsedSubjects = JSON.parse(subjects);
      } catch (error) {
        console.error('Failed to parse subjects:', error);
        throw new Error('Invalid JSON format for subjects');
      }
    } else {
      parsedSubjects = [];
    }

    const slug = await this.slugHelper.generateUniqueSlug(title);
    const audio = await this.prisma.contents.update({
      where: { uuid: uuid, type: 'AudioPodcast' },
      data: {
        title,
        thumbnail,
        description,
        subjects: parsedSubjects,
        slug,
        category: { connect: { uuid: category.uuid } },
        AudioPodcasts: {
          update: {
            where: { content_id: content.id },
            data: {
              creator_id: creator.id,
              duration: duration || 0,
              file_url,
            },
          },
        },
        Genres: {
          connectOrCreate: parsedGenres?.map((genre) => ({
            where: { name: genre.name },
            create: {
              name: genre.name,
              avatar_url:
                genre.avatar_url ||
                'https://images.unsplash.com/photo-1494537176433-7a3c4ef2046f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
              description: genre.description || 'No description available.',
            },
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
