import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMajorDto } from './dto/create-major.dto';
import { UpdateMajorDto } from './dto/update-major.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MajorsService {
  constructor(private prisma: PrismaService) {}

  async create(createMajorDto: CreateMajorDto) {
    const major = await this.prisma.majors.create({ data: createMajorDto });

    return {
      status: 'success',
      message: 'Majors succesfully added!',
      data: { id: major.uuid },
    };
  }

  async findAll() {
    const majors = await this.prisma.majors.findMany();
    return {
      status: 'success',
      data: majors.map((major) => ({
        id: major.uuid,
        image: major.image,
        avatar: major.avatar,
        name: major.name,
        description: major.description,
      })),
    };
  }

  async findOne(id: string) {
    const major = await this.prisma.majors.findUnique({ where: { uuid: id } });

    if (!major) {
      throw new NotFoundException(`Major with ${id} does not exist.`);
    }
    return {
      status: 'success',
      data: {
        image: major.image,
        avatar: major.avatar,
        name: major.name,
        description: major.description,
      },
    };
  }

  async update(id: string, updateMajorDto: UpdateMajorDto) {
    const { name, avatar, description, image } = updateMajorDto;
    const major = await this.prisma.majors.update({
      where: { uuid: id },
      data: {
        name,
        avatar,
        description,
        image,
      },
    });

    return {
      status: 'success',
      message: 'Majors succesfully updated!',
      data: { id: major.uuid },
    };
  }

  remove(id: string) {
    return `This action removes a #${id} major`;
  }
}
