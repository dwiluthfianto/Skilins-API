import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAudioPodcastDto } from './dto/create-audio-podcast.dto';
import { UpdateAudioPodcastDto } from './dto/update-audio-podcast.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AudioPodcastsService {
  constructor(private prisma: PrismaService) {}

  async create(createAudioPodcastDto: CreateAudioPodcastDto) {
    const {
      title,
      thumbnail,
      description,
      subjects,
      category_uuid,
      duration,
      file_url,
      creator_uuid,
    } = createAudioPodcastDto;

    const audio = await this.prisma.contents.create({
      data: {
        type: 'AudioPodcast',
        title,
        thumbnail,
        description,
        subjects,
        category: { connect: { uuid: category_uuid } },
        AudioPodcasts: {
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
      message: 'audio successfully uploaded!',
      data: {
        id: audio.uuid,
      },
    };
  }

  async findAll() {
    const audios = await this.prisma.contents.findMany({
      where: { type: 'AudioPodcast' },
      include: {
        category: true,
        tags: true,
        likes: true,
        comments: true,
        AudioPodcasts: {
          include: {
            creator: true,
          },
        },
      },
    });

    return {
      status: 'success',
      data: audios.map((audio) => ({
        id: audio.uuid,
        thumbnail: audio.thumbnail,
        title: audio.title,
        description: audio.description,
        subjects: audio.subjects,
        create_at: audio.created_at,
        updated_at: audio.updated_at,
        category: audio.category.name,
        creator: audio.AudioPodcasts[0].creator.name,
        duration: audio.AudioPodcasts[0].duration,
        file_url: audio.AudioPodcasts[0].file_url,
        tags: audio.tags.map((tag) => ({
          id: tag.uuid,
          name: tag.name,
        })),
        comments: audio.comments.map((comment) => ({
          id: comment.uuid,
          subject: comment.subject,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          commented_by: comment.commented_by,
        })),
        likes: audio.likes.map((like) => ({
          id: like.uuid,
          created_at: like.created_at,
          liked_by: like.liked_by,
        })),
      })),
    };
  }

  async findOne(uuid: string) {
    const audio = await this.prisma.contents.findUnique({
      where: { uuid },
      include: {
        category: true,
        tags: true,
        likes: true,
        comments: true,
        AudioPodcasts: {
          include: {
            creator: true,
          },
        },
      },
    });
    if (!audio) {
      throw new NotFoundException(`Audio with Id ${uuid} does not exist`);
    }
    return {
      status: 'success',
      data: {
        id: audio.uuid,
        thumbnail: audio.thumbnail,
        title: audio.title,
        description: audio.description,
        subjects: audio.subjects,
        create_at: audio.created_at,
        updated_at: audio.updated_at,
        category: audio.category.name,
        creator: audio.AudioPodcasts[0].creator.name,
        duration: audio.AudioPodcasts[0].duration,
        file_url: audio.AudioPodcasts[0].file_url,
        tags: audio.tags.map((tag) => ({
          id: tag.uuid,
          name: tag.name,
        })),
        comments: audio.comments.map((comment) => ({
          id: comment.uuid,
          subject: comment.subject,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          commented_by: comment.commented_by,
        })),
        likes: audio.likes.map((like) => ({
          id: like.uuid,
          created_at: like.created_at,
          liked_by: like.liked_by,
        })),
      },
    };
  }

  async update(uuid: string, updateAudioPodcastDto: UpdateAudioPodcastDto) {
    const {
      title,
      thumbnail,
      description,
      subjects,
      category_uuid,
      duration,
      file_url,
      creator_uuid,
    } = updateAudioPodcastDto;

    const isExists = await this.prisma.contents.findUnique({
      where: { uuid: uuid },
    });

    if (!isExists) {
      throw new NotFoundException(`Audio with Id ${uuid} does not exist`);
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

    const audio = await this.prisma.contents.update({
      where: { uuid: uuid, type: 'AudioPodcast' },
      data: {
        title,
        thumbnail,
        description,
        subjects,
        category: { connect: { uuid: category_uuid } },
        AudioPodcasts: {
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
      message: 'audio successfully updated!',
      data: {
        id: audio.uuid,
      },
    };
  }

  async remove(uuid: string) {
    const isExists = await this.prisma.contents.findUnique({
      where: { uuid },
    });

    if (!isExists) {
      throw new NotFoundException(`Audio with UUID ${uuid} does not exist`);
    }

    const audio = await this.prisma.contents.delete({
      where: { uuid: uuid },
    });
    return {
      status: 'success',
      message: 'audio successfully deleted!',
      data: {
        id: audio.uuid,
      },
    };
  }
}
