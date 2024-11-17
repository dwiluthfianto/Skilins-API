import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UuidHelper {
  constructor(private readonly prisma: PrismaService) {}

  async validateUuidContent(uuid: string) {
    const content = await this.prisma.contents.findUniqueOrThrow({
      where: { uuid },
      select: { id: true, uuid: true },
    });
    return content;
  }

  async validateUuidCategory(name: string) {
    const category = await this.prisma.categories.findUniqueOrThrow({
      where: { name },
      select: { id: true, uuid: true },
    });
    return category;
  }

  async validateUuidCreator(uuid: string) {
    const creator = await this.prisma.users.findUniqueOrThrow({
      where: { uuid },
      select: {
        id: true,
        uuid: true,
        Students: {
          select: {
            id: true,
          },
        },
      },
    });
    return creator;
  }
}
