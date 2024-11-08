import { Injectable } from '@nestjs/common';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GenresService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createGenreDto: CreateGenreDto) {
    const { avatar_url, name, description } = createGenreDto;
    const genre = await this.prisma.genres.create({
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
      message: 'genre successfully added!',
      data: {
        uuid: genre.uuid,
      },
    };
  }

  async findAll() {
    const genres = await this.prisma.genres.findMany();
    return {
      status: 'success',
      data: genres.map((genre) => ({
        id: genre.uuid,
        avatar_url: genre.avatar_url,
        text: genre.name,
        description: genre.description,
      })),
    };
  }

  async findOne(name: string) {
    const genre = await this.prisma.genres.findUniqueOrThrow({
      where: { name },
    });
    return {
      status: 'success',
      data: {
        uuid: genre.uuid,
        avatar_url: genre.avatar_url,
        name: genre.name,
        description: genre.description,
      },
    };
  }
  async findOneByUuid(uuid: string) {
    const genre = await this.prisma.genres.findUniqueOrThrow({
      where: { uuid },
    });
    return {
      status: 'success',
      data: {
        uuid: genre.uuid,
        avatar_url: genre.avatar_url,
        name: genre.name,
        description: genre.description,
      },
    };
  }
  async update(uuid: string, updateGenreDto: UpdateGenreDto) {
    const { avatar_url, name, description } = updateGenreDto;

    await this.prisma.genres.findUniqueOrThrow({ where: { uuid } });

    const genre = await this.prisma.genres.update({
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
      message: 'genres successfully updated!',
      data: {
        uuid: genre.uuid,
      },
    };
  }

  async remove(uuid: string) {
    await this.prisma.genres.findUniqueOrThrow({ where: { uuid } });

    const genre = await this.prisma.genres.delete({ where: { uuid } });

    return {
      status: 'success',
      message: 'genre successfully deleted!',
      data: {
        uuid: genre.uuid,
      },
    };
  }
}
