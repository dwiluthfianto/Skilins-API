import { Injectable } from '@nestjs/common';
import { CreateVideoPodcastDto } from './dto/create-video-podcast.dto';
import { UpdateVideoPodcastDto } from './dto/update-video-podcast.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UuidHelper } from 'src/common/helpers/uuid.helper';

@Injectable()
export class VideoPodcastsService {
  constructor(
    private prisma: PrismaService,
    private readonly uuidHelper: UuidHelper,
  ) {}
  async create(createVideoPodcastDto: CreateVideoPodcastDto) {
    const {
      title,
      thumbnail,
      description,
      subjects,
      category_name,
      duration,
      file_url,
      creator_uuid,
      tags,
    } = createVideoPodcastDto;

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

    const video = await this.prisma.contents.create({
      data: {
        type: 'VideoPodcast',
        title,
        thumbnail,
        description,
        subjects: parsedSubjects,
        category: { connect: { name: category_name } },
        VideoPodcasts: {
          create: {
            creator: { connect: { uuid: creator_uuid } },
            duration,
            file_url,
          },
        },
        tags: {
          connectOrCreate: parsedTags?.map((tag) => ({
            where: { name: tag.name },
            create: {
              name: tag.name,
              avatar_url:
                tag.avatar_url ||
                'https://images.unsplash.com/photo-1494537176433-7a3c4ef2046f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
              description: tag.description || 'No description available.',
            },
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

  async findAll() {
    const videos = await this.prisma.contents.findMany({
      where: { type: 'VideoPodcast' },
      include: {
        category: true,
        tags: true,
        likes: true,
        comments: true,
        VideoPodcasts: {
          include: {
            creator: true,
          },
        },
      },
    });

    return {
      status: 'success',
      data: videos.map((video) => ({
        uuid: video.uuid,
        thumbnail: video.thumbnail,
        title: video.title,
        description: video.description,
        subjects: video.subjects,
        create_at: video.created_at,
        updated_at: video.updated_at,
        category: video.category.name,
        creator: video.VideoPodcasts[0].creator.name,
        duration: video.VideoPodcasts[0].duration,
        file_url: video.VideoPodcasts[0].file_url,
        tags: video.tags.map((tag) => ({
          uuid: tag.uuid,
          name: tag.name,
        })),
        comments: video.comments.map((comment) => ({
          uuid: comment.uuid,
          subject: comment.comment_content,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          commented_by: comment.commented_by,
        })),
        likes: video.likes.map((like) => ({
          uuid: like.uuid,
          created_at: like.created_at,
          liked_by: like.liked_by,
        })),
      })),
    };
  }

  async findOne(uuid: string) {
    const video = await this.prisma.contents.findUniqueOrThrow({
      where: { uuid },
      include: {
        category: true,
        tags: true,
        likes: true,
        comments: true,
        VideoPodcasts: {
          include: {
            creator: true,
          },
        },
      },
    });
    return {
      status: 'success',
      data: {
        uuid: video.uuid,
        thumbnail: video.thumbnail,
        title: video.title,
        description: video.description,
        subjects: video.subjects,
        create_at: video.created_at,
        updated_at: video.updated_at,
        category: video.category.name,
        creator: video.VideoPodcasts[0].creator.name,
        duration: video.VideoPodcasts[0].duration,
        file_url: video.VideoPodcasts[0].file_url,
        tags: video.tags.map((tag) => ({
          uuid: tag.uuid,
          name: tag.name,
        })),
        comments: video.comments.map((comment) => ({
          uuid: comment.uuid,
          subject: comment.comment_content,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          commented_by: comment.commented_by,
        })),
        likes: video.likes.map((like) => ({
          uuid: like.uuid,
          created_at: like.created_at,
          liked_by: like.liked_by,
        })),
      },
    };
  }

  async update(uuid: string, updateVideoPodcastDto: UpdateVideoPodcastDto) {
    const {
      title,
      thumbnail,
      description,
      subjects,
      category_name,
      duration,
      file_url,
      creator_uuid,
      tags,
    } = updateVideoPodcastDto;

    const content = await this.uuidHelper.validateUuidContent(uuid);
    const creator = await this.uuidHelper.validateUuidCreator(creator_uuid);
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

    const video = await this.prisma.contents.update({
      where: { uuid, type: 'VideoPodcast' },
      data: {
        title,
        thumbnail,
        description,
        subjects: parsedSubjects,
        category: { connect: { name: category.name } },
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
        tags: {
          connectOrCreate: parsedTags?.map((tag) => ({
            where: { name: tag.name },
            create: {
              name: tag.name,
              avatar_url:
                tag.avatar_url ||
                'https://images.unsplash.com/photo-1494537176433-7a3c4ef2046f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
              description: tag.description || 'No description available.',
            },
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
