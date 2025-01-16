import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMajorDto } from './dto/create-major.dto';
import { UpdateMajorDto } from './dto/update-major.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MajorsService {
  constructor(private prisma: PrismaService) {}

  async create(createMajorDto: CreateMajorDto) {
    const { name, avatar_url, description, image_url } = createMajorDto;

    const res = await this.prisma.$transaction(async (p) => {
      const major = await p.majors.create({
        data: { name, avatar_url, description, image_url },
      });

      return {
        status: 'success',
        message: 'Majors succesfully added!',
        data: { uuid: major.uuid },
      };
    });

    return res;
  }

  async findAll(name: string) {
    const majors = await this.prisma.majors.findMany({
      where: { name: { contains: name, mode: 'insensitive' } },
    });
    return {
      status: 'success',
      data: majors.map((major) => ({
        uuid: major.uuid,
        avatar_url: major.avatar_url,
        name: major.name,
        description: major.description,
      })),
    };
  }

  async findOne(uuid: string) {
    const major = await this.prisma.majors.findUnique({
      where: { uuid },
    });

    if (!major) {
      throw new NotFoundException(`Major does not exist.`);
    }
    return {
      status: 'success',
      data: {
        image_url: major.image_url,
        avatar_url: major.avatar_url,
        name: major.name,
        description: major.description,
      },
    };
  }

  async update(uuid: string, updateMajorDto: UpdateMajorDto) {
    const { name, avatar_url, description, image_url } = updateMajorDto;

    const res = await this.prisma.$transaction(async (p) => {
      const major = await p.majors.findUniqueOrThrow({ where: { uuid } });

      if (!major) {
        throw new NotFoundException('Major is not found!');
      }

      const res = await p.majors.update({
        where: { uuid: uuid },
        data: {
          name,
          avatar_url,
          description,
          image_url,
        },
      });

      return {
        status: 'success',
        message: 'Majors succesfully updated!',
        data: { uuid: res.uuid },
      };
    });

    return res;
  }

  async remove(uuid: string) {
    await this.prisma.majors.findUniqueOrThrow({ where: { uuid } });

    const major = await this.prisma.majors.delete({ where: { uuid } });
    return {
      status: 'success',
      message: 'major successfully deleted!',
      data: {
        uuid: major.uuid,
      },
    };
  }
}
