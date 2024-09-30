import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAudioPodcastDto } from './dto/create-audio-podcast.dto';
import { UpdateAudioPodcastDto } from './dto/update-audio-podcast.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UuidHelper } from 'src/common/helpers/uuid.helper';

@Injectable()
export class AudioPodcastsService {
  constructor(
    private prisma: PrismaService,
    private readonly uuidHelper: UuidHelper,
  ) {}

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
      tags,
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
        tags: {
          connectOrCreate: tags.map((tag) => ({
            where: { name: tag.name },
            create: {
              name: tag.name,
              avatar_url: tag.avatar_url || 'default-avatar.jpg',
              description: tag.description || 'No description available.',
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
        uuid: audio.uuid,
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
          uuid: tag.uuid,
          name: tag.name,
        })),
        comments: audio.comments.map((comment) => ({
          uuid: comment.uuid,
          content: comment.comment_content,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          commented_by: comment.commented_by,
        })),
        likes: audio.likes.map((like) => ({
          uuid: like.uuid,
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
        uuid: audio.uuid,
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
          uuid: tag.uuid,
          name: tag.name,
        })),
        comments: audio.comments.map((comment) => ({
          uuid: comment.uuid,
          subject: comment.comment_content,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          commented_by: comment.commented_by,
        })),
        likes: audio.likes.map((like) => ({
          uuid: like.uuid,
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
      tags,
    } = updateAudioPodcastDto;

    const content = await this.uuidHelper.validateUuidContent(uuid);
    const creator = await this.uuidHelper.validateUuidCreator(creator_uuid);
    const category = await this.uuidHelper.validateUuidCategory(category_uuid);

    const audio = await this.prisma.contents.update({
      where: { uuid: uuid, type: 'AudioPodcast' },
      data: {
        title,
        thumbnail,
        description,
        subjects,
        category: { connect: { id: category.id } },
        AudioPodcasts: {
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
          connectOrCreate: tags.map((tag) => ({
            where: { name: tag.name },
            create: {
              name: tag.name,
              avatar_url: tag.avatar_url || 'default-avatar.jpg',
              description: tag.description || 'No description available.',
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
