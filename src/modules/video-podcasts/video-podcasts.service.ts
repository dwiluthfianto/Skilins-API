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
      category_uuid,
      duration,
      file_url,
      creator_uuid,
    } = createVideoPodcastDto;

    const video = await this.prisma.contents.create({
      data: {
        type: 'VideoPodcast',
        title,
        thumbnail,
        description,
        subjects,
        category: { connect: { uuid: category_uuid } },
        VideoPodcasts: {
          create: {
            creator: { connect: { uuid: creator_uuid } },
            duration,
            file_url,
          },
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
      category_uuid,
      duration,
      file_url,
      creator_uuid,
    } = updateVideoPodcastDto;

    const content = await this.uuidHelper.validateUuidContent(uuid);
    const creator = await this.uuidHelper.validateUuidCreator(creator_uuid);
    const category = await this.uuidHelper.validateUuidCategory(category_uuid);

    const video = await this.prisma.contents.update({
      where: { uuid, type: 'VideoPodcast' },
      data: {
        title,
        thumbnail,
        description,
        subjects,
        category: { connect: { id: category.id } },
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
