import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UuidHelper } from 'src/common/helpers/uuid.helper';

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
        avatar_url,
        description,
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

  async findAll() {
    const categories = await this.prisma.categories.findMany();
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

  async findOne(uuid: string) {
    const category = await this.prisma.categories.findUniqueOrThrow({
      where: { uuid },
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

  async update(uuid: string, updateCategoryDto: UpdateCategoryDto) {
    const { name, avatar_url, description } = updateCategoryDto;
    await this.uuidHelper.validateUuidCategory(uuid);
    const category = await this.prisma.categories.update({
      where: {
        uuid,
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

  async remove(uuid: string) {
    await this.uuidHelper.validateUuidContent(uuid);
    const category = await this.prisma.categories.delete({
      where: { uuid },
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
