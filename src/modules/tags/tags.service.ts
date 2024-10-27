import { Injectable } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createTagDto: CreateTagDto) {
    const { avatar_url, name, description } = createTagDto;
    const tag = await this.prisma.tags.create({
      data: {
        name,
        avatar_url:
          avatar_url ||
          'https://images.unsplash.com/photo-1494537176433-7a3c4ef2046f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        description: description || 'No description available.',
      },
    });

    return {
      status: 'success',
      message: 'tags successfully added!',
      data: {
        uuid: tag.uuid,
      },
    };
  }

  async findAll() {
    const tags = await this.prisma.tags.findMany();
    return {
      status: 'success',
      data: tags.map((tag) => ({
        uuid: tag.uuid,
        avatar_url: tag.avatar_url,
        name: tag.name,
        description: tag.description,
      })),
    };
  }

  async findOne(name: string) {
    const tag = await this.prisma.tags.findUniqueOrThrow({ where: { name } });
    return {
      status: 'success',
      data: {
        uuid: tag.uuid,
        avatar_url: tag.avatar_url,
        name: tag.name,
        description: tag.description,
      },
    };
  }
  async findOneByUuid(uuid: string) {
    const tag = await this.prisma.tags.findUniqueOrThrow({ where: { uuid } });
    return {
      status: 'success',
      data: {
        uuid: tag.uuid,
        avatar_url: tag.avatar_url,
        name: tag.name,
        description: tag.description,
      },
    };
  }

  async update(uuid: string, updateTagDto: UpdateTagDto) {
    const { avatar_url, name, description } = updateTagDto;

    await this.prisma.tags.findUniqueOrThrow({ where: { uuid } });

    const tag = await this.prisma.tags.update({
      where: { uuid },
      data: {
        name,
        avatar_url:
          avatar_url ||
          'https://images.unsplash.com/photo-1494537176433-7a3c4ef2046f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        description: description || 'No description available.',
      },
    });

    return {
      status: 'success',
      message: 'tags successfully updated!',
      data: {
        uuid: tag.uuid,
      },
    };
  }

  async remove(uuid: string) {
    await this.prisma.tags.findUniqueOrThrow({ where: { uuid } });

    const tag = await this.prisma.tags.delete({ where: { uuid } });

    return {
      status: 'success',
      message: 'tag successfully deleted!',
      data: {
        uuid: tag.uuid,
      },
    };
  }
}
