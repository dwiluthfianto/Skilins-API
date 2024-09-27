import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVideoPodcastDto } from './dto/create-video-podcast.dto';
import { UpdateVideoPodcastDto } from './dto/update-video-podcast.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class VideoPodcastsService {
  constructor(private prisma: PrismaService) {}
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
        id: video.uuid,
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
        id: video.uuid,
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
          id: tag.uuid,
          name: tag.name,
        })),
        comments: video.comments.map((comment) => ({
          id: comment.uuid,
          subject: comment.subject,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          commented_by: comment.commented_by,
        })),
        likes: video.likes.map((like) => ({
          id: like.uuid,
          created_at: like.created_at,
          liked_by: like.liked_by,
        })),
      })),
    };
  }

  async findOne(uuid: string) {
    const video = await this.prisma.contents.findUnique({
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
    if (!video) {
      throw new NotFoundException(`Video with Id ${uuid} does not exist`);
    }
    return {
      status: 'success',
      data: {
        id: video.uuid,
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
          id: tag.uuid,
          name: tag.name,
        })),
        comments: video.comments.map((comment) => ({
          id: comment.uuid,
          subject: comment.subject,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          commented_by: comment.commented_by,
        })),
        likes: video.likes.map((like) => ({
          id: like.uuid,
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

    const isExists = await this.prisma.contents.findUnique({
      where: { uuid: uuid },
    });

    if (!isExists) {
      throw new NotFoundException(`Video with Id ${uuid} does not exist`);
    }

    const creator = await this.prisma.students.findUnique({
      where: { uuid: creator_uuid },
      select: { id: true },
    });

    if (!creator) {
      throw new NotFoundException(
        `Creator with ID ${creator_uuid} does not exist`,
      );
    }

    const video = await this.prisma.contents.update({
      where: { uuid: uuid, type: 'VideoPodcast' },
      data: {
        title,
        thumbnail,
        description,
        subjects,
        category: { connect: { uuid: category_uuid } },
        VideoPodcasts: {
          update: {
            where: { content_id: isExists.id },
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
        id: video.uuid,
      },
    };
  }

  async remove(uuid: string) {
    const isExists = await this.prisma.contents.findUnique({
      where: { uuid },
    });

    if (!isExists) {
      throw new NotFoundException(`Video with UUID ${uuid} does not exist`);
    }

    const video = await this.prisma.contents.delete({
      where: { uuid: uuid },
    });
    return {
      status: 'success',
      message: 'video successfully deleted!',
      data: {
        id: video.uuid,
      },
    };
  }
}
