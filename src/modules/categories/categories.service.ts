import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const { name, avatar, description } = createCategoryDto;
    const category = await this.prisma.categories.create({
      data: {
        name,
        avatar,
        description,
      },
    });

    return {
      status: 'success',
      message: 'Category succefully added',
      data: {
        id: category.uuid,
      },
    };
  }

  async findAll() {
    const categories = await this.prisma.categories.findMany();
    return {
      status: 'success',
      data: categories.map((category) => ({
        id: category.uuid,
        avatar: category.avatar,
        name: category.name,
        description: category.description,
      })),
    };
  }

  async findOne(id: string) {
    const category = await this.prisma.categories.findUnique({
      where: { uuid: id },
    });
    return {
      status: 'success',
      data: {
        id: category.uuid,
        avatar: category.avatar,
        name: category.name,
        description: category.description,
      },
    };
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const { name, avatar, description } = updateCategoryDto;
    const category = await this.prisma.categories.update({
      where: {
        uuid: id,
      },
      data: {
        name,
        avatar,
        description,
      },
    });

    return {
      status: 'success',
      message: 'Category succefully updated',
      data: {
        id: category.uuid,
      },
    };
  }

  async remove(id: string) {
    const category = await this.prisma.categories.delete({
      where: { uuid: id },
    });

    return {
      status: 'success',
      message: 'Ebook have been removed',
      data: {
        id: category.uuid,
      },
    };
  }
}
