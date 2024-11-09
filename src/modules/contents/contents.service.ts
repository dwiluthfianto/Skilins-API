import { Injectable } from '@nestjs/common';
import { UuidHelper } from 'src/common/helpers/uuid.helper';
import { PrismaService } from 'src/prisma/prisma.service';
import { ContentStatus } from '@prisma/client';

@Injectable()
export class ContentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uuidHelper: UuidHelper,
  ) {}

  async updateContentStatus(uuid: string, status: ContentStatus) {
    const content = await this.uuidHelper.validateUuidContent(uuid);

    await this.prisma.contents.update({
      where: { id: content.id },
      data: {
        status: status,
      },
    });

    return {
      status: 'success',
      message: `Content status updated to ${status}`,
      data: {
        uuid,
        status: status,
      },
    };
  }
}
