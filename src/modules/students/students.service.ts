import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}
  async create(createStudentDto: CreateStudentDto) {
    const { name, major_id, birthplace, birthdate, age, status } =
      createStudentDto;
    const student = await this.prisma.students.create({
      data: {
        name,
        birthdate,
        birthplace,
        age,
        status,
        major: { connect: { uuid: major_id } },
      },
    });

    return {
      status: 'success',
      message: 'student succesfully added!',
      data: { id: student.uuid },
    };
  }

  async findAll() {
    const students = await this.prisma.students.findMany();
    return {
      status: 'success',
      data: students.map((student) => ({
        id: student.uuid,
        name: student.name,
        birthplace: student.birthplace,
        birthdate: student.birthdate,
        age: student.age,
        status: student.status,
      })),
    };
  }

  async findOne(id: string) {
    const student = await this.prisma.students.findUnique({
      where: { uuid: id },
    });

    if (!student) {
      throw new NotFoundException(`Student with Id ${id} does not exist`);
    }
    return {
      status: 'success',
      data: {
        id: student.uuid,
        name: student.name,
        birthplace: student.birthplace,
        birthdate: student.birthdate,
        age: student.age,
        status: student.status,
      },
    };
  }

  async update(id: string, updateStudentDto: UpdateStudentDto) {
    const { name, major_id, birthplace, birthdate, age, status } =
      updateStudentDto;
    const student = await this.prisma.students.update({
      where: { uuid: id },
      data: {
        name,
        birthdate,
        birthplace,
        age,
        status,
        major: { connect: { uuid: major_id } },
      },
    });

    return {
      status: 'success',
      message: 'student succesfully updated!',
      data: { id: student.uuid },
    };
  }

  async remove(id: string) {
    const isExist = await this.prisma.students.findUnique({
      where: { uuid: id },
    });

    if (!isExist) {
      throw new NotFoundException(`Student with Id ${id} does not exist`);
    }
    await this.prisma.students.delete({
      where: { uuid: id },
    });

    return {
      status: 'success',
      message: 'student succesfully deleted',
      data: {
        id,
      },
    };
  }
}
