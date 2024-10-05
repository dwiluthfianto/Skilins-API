import { Injectable } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}
  async create(createStudentDto: CreateStudentDto) {
    const { nis, image_url, name, major, birthplace, birthdate, sex, status } =
      createStudentDto;
    const student = await this.prisma.students.create({
      data: {
        nis,
        image_url,
        name,
        birthdate,
        birthplace,
        sex,
        status,
        major: { connect: { name: major } },
      },
    });

    return {
      status: 'success',
      message: 'student succesfully added!',
      data: { uuid: student.uuid },
    };
  }

  async findAll() {
    const students = await this.prisma.students.findMany({
      include: { major: true },
    });
    return {
      status: 'success',
      data: students.map((student) => ({
        uuid: student.uuid,
        image_url: student.image_url,
        nis: student.nis,
        name: student.name,
        birthplace: student.birthplace,
        birthdate: student.birthdate,
        sex: student.sex,
        major: student.major.name,
        status: student.status,
      })),
    };
  }

  async findOne(uuid: string) {
    const student = await this.prisma.students.findUniqueOrThrow({
      where: { uuid },
      include: { major: true },
    });

    return {
      status: 'success',
      data: {
        uuid: student.uuid,
        image_url: student.image_url,
        nis: student.nis,
        name: student.name,
        birthplace: student.birthplace,
        birthdate: student.birthdate,
        sex: student.sex,
        major: student.major.name,
        status: student.status,
      },
    };
  }

  async update(uuid: string, updateStudentDto: UpdateStudentDto) {
    const { image_url, nis, name, major, birthplace, birthdate, sex, status } =
      updateStudentDto;

    await this.prisma.majors.findUniqueOrThrow({ where: { name: major } });
    await this.prisma.students.findUniqueOrThrow({ where: { uuid } });

    const student = await this.prisma.students.update({
      where: { uuid },
      data: {
        image_url,
        nis,
        name,
        birthdate,
        birthplace,
        sex,
        status,
        major: { connect: { name: major } },
      },
    });

    return {
      status: 'success',
      message: 'student succesfully updated!',
      data: { uuid: student.uuid },
    };
  }

  async remove(uuid: string) {
    await this.prisma.students.findUniqueOrThrow({
      where: { uuid },
    });
    await this.prisma.students.delete({
      where: { uuid },
    });

    return {
      status: 'success',
      message: 'student succesfully deleted',
      data: {
        uuid,
      },
    };
  }
}
