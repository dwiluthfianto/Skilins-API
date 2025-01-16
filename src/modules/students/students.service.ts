import { Injectable } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, RoleType } from '@prisma/client';
import { FindStudentDto } from './dto/find-student.dto';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}
  async create(createStudentDto: CreateStudentDto) {
    const { nis, name, major, birthplace, birthdate, sex, user_uuid } =
      createStudentDto;

    const res = await this.prisma.$transaction(async (p) => {
      const student = await p.students.create({
        data: {
          nis,
          name,
          birthdate,
          birthplace,
          sex,
          user: { connect: { uuid: user_uuid } },
          major: { connect: { name: major } },
        },
      });

      return {
        status: 'success',
        message: 'student succesfully added!',
        data: { uuid: student.uuid },
      };
    });

    return res;
  }

  async findAll(query: FindStudentDto) {
    const { page, limit, nis, name, major, status } = query;

    const nisFilter = {
      nis: {
        contains: nis,
        mode: Prisma.QueryMode.insensitive,
      },
    };

    const nameFilter = {
      name: {
        contains: name,
        mode: Prisma.QueryMode.insensitive,
      },
    };

    const majorFilter = major
      ? {
          major: {
            name: {
              equals: major,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        }
      : {};

    const statusFilter = status
      ? {
          status: {
            equals: status,
          },
        }
      : {};

    const filter = {
      ...nisFilter,
      ...nameFilter,
      ...majorFilter,
      ...statusFilter,
    };

    const students = await this.prisma.students.findMany({
      ...(page && limit ? { skip: (page - 1) * limit, take: limit } : {}),
      where: { ...filter },
      include: { major: true },
    });

    const total = await this.prisma.students.count({
      where: { ...filter },
    });

    return {
      status: 'success',
      data: students.map((student) => ({
        uuid: student.uuid,
        nis: student.nis,
        name: student.name,
        birthplace: student.birthplace,
        birthdate: student.birthdate,
        sex: student.sex,
        major: student.major.name,
        status: student.status,
      })),
      totalPages: total,
      page: page || 1,
      lastPage: limit ? Math.ceil(total / limit) : 1,
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
    const { nis, name, major, birthplace, birthdate, sex } = updateStudentDto;

    const res = await this.prisma.$transaction(async (p) => {
      await this.prisma.majors.findUniqueOrThrow({ where: { name: major } });
      await this.prisma.students.findUniqueOrThrow({ where: { uuid } });

      const student = await p.students.update({
        where: { uuid },
        data: {
          nis,
          name,
          birthdate,
          birthplace,
          sex,
          major: { connect: { name: major } },
        },
      });

      return {
        status: 'success',
        message: 'student succesfully updated!',
        data: { uuid: student.uuid },
      };
    });

    return res;
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

  async verifiedStudent(uuid: string) {
    const student = await this.prisma.students.findUniqueOrThrow({
      where: { uuid },
    });

    await this.prisma.students.update({
      where: { uuid: student.uuid },
      data: {
        status: true,
      },
    });

    await this.prisma.users.update({
      where: {
        id: student.user_id,
      },
      data: {
        roles: { connect: { name: RoleType.Student } },
      },
    });

    return {
      status: 'success',
      message: 'Student verified!',
      data: {
        uuid: student.uuid,
      },
    };
  }
}
