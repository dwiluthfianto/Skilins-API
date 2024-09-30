import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}
  async create(createStudentDto: CreateStudentDto) {
    const {
      nis,
      image_url,
      name,
      major_uuid,
      birthplace,
      birthdate,
      age,
      status,
    } = createStudentDto;
    const student = await this.prisma.students.create({
      data: {
        nis,
        image_url,
        name,
        birthdate,
        birthplace,
        age,
        status,
        major: { connect: { uuid: major_uuid } },
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
        age: student.age,
        major: student.major.name,
        status: student.status,
      })),
    };
  }

  async findOne(uuid: string) {
    const student = await this.prisma.students.findUnique({
      where: { uuid },
      include: { major: true },
    });

    if (!student) {
      throw new NotFoundException(`Student with Id ${uuid} does not exist`);
    }
    return {
      status: 'success',
      data: {
        uuid: student.uuid,
        image_url: student.image_url,
        nis: student.nis,
        name: student.name,
        birthplace: student.birthplace,
        birthdate: student.birthdate,
        age: student.age,
        major: student.major.name,
        status: student.status,
      },
    };
  }

  async update(uuid: string, updateStudentDto: UpdateStudentDto) {
    const {
      image_url,
      nis,
      name,
      major_uuid,
      birthplace,
      birthdate,
      age,
      status,
    } = updateStudentDto;
    const student = await this.prisma.students.update({
      where: { uuid },
      data: {
        image_url,
        nis,
        name,
        birthdate,
        birthplace,
        age,
        status,
        major: { connect: { uuid: major_uuid } },
      },
    });

    return {
      status: 'success',
      message: 'student succesfully updated!',
      data: { uuid: student.uuid },
    };
  }

  async remove(uuid: string) {
    const isExist = await this.prisma.students.findUnique({
      where: { uuid },
    });

    if (!isExist) {
      throw new NotFoundException(`Student with Id ${uuid} does not exist`);
    }
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
