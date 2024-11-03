import { Injectable } from '@nestjs/common';
import { UuidHelper } from 'src/common/helpers/uuid.helper';
import { PrismaService } from 'src/prisma/prisma.service';
import { ContentApproveDto } from './dto/content-approve.dto';

@Injectable()
export class ContentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uuidHelper: UuidHelper,
  ) {}

  async approveContent(uuid: string, contentApproveDto: ContentApproveDto) {
    const content = await this.uuidHelper.validateUuidContent(uuid);

    await this.prisma.contents.update({
      where: { id: content.id },
      data: {
        status: contentApproveDto.status,
      },
    });

    return {
      status: 'success',
      message: 'Content approved and got published!',
      data: {
        uuid,
      },
    };
  }
}
