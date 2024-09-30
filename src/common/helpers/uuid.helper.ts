import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UuidHelper {
  constructor(private readonly prisma: PrismaService) {}

  async validateUuidContent(uuid: string) {
    const content = await this.prisma.contents.findUnique({
      where: { uuid },
      select: { id: true },
    });
    if (!content) {
      throw new NotFoundException(`Content with UUID ${uuid} does not exist`);
    }
    return content;
  }

  async validateUuidCategory(uuid: string) {
    const category = await this.prisma.categories.findUnique({
      where: { uuid },
      select: { id: true },
    });
    if (!category) {
      throw new NotFoundException(`Category with UUID ${uuid} does not exist`);
    }
    return category;
  }

  async validateUuidCreator(uuid: string) {
    const creator = await this.prisma.students.findUnique({
      where: { uuid },
      select: { id: true },
    });
    if (!creator) {
      throw new NotFoundException(`Creator with UUID ${uuid} does not exist`);
    }
    return creator;
  }
}
