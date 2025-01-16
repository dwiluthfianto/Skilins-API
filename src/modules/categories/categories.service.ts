import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UuidHelper } from 'src/common/helpers/uuid.helper';
import { Prisma } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    private readonly uuidHelper: UuidHelper,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const { name, avatar_url, description } = createCategoryDto;

    const category = await this.prisma.categories.create({
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
      message: 'category successfully added!',
      data: {
        uuid: category.uuid,
      },
    };
  }

  async findAll(name: string) {
    const filterByName = name
      ? {
          name: {
            contains: name,
            mode: Prisma.QueryMode.insensitive,
          },
        }
      : {};

    const categories = await this.prisma.categories.findMany({
      where: {
        ...filterByName,
      },
    });
    return {
      status: 'success',
      data: categories.map((category) => ({
        uuid: category.uuid,
        avatar_url: category.avatar_url,
        name: category.name,
        description: category.description,
      })),
    };
  }

  async findOne(name: string) {
    const category = await this.prisma.categories.findUniqueOrThrow({
      where: { name },
    });
    return {
      status: 'success',
      data: {
        uuid: category.uuid,
        avatar_url: category.avatar_url,
        name: category.name,
        description: category.description,
      },
    };
  }

  async update(nameCategory: string, updateCategoryDto: UpdateCategoryDto) {
    const { name, avatar_url, description } = updateCategoryDto;

    const category = await this.prisma.categories.update({
      where: {
        name: nameCategory,
      },
      data: {
        name,
        avatar_url,
        description,
      },
    });

    return {
      status: 'success',
      message: 'Category succefully updated',
      data: {
        uuid: category.uuid,
      },
    };
  }

  async remove(nameCategory: string) {
    const category = await this.prisma.categories.delete({
      where: { name: nameCategory },
    });

    return {
      status: 'success',
      message: 'category successfully deleted!',
      data: {
        uuid: category.uuid,
      },
    };
  }
}
