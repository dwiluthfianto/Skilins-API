import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateLikeDto } from './dto/update-like.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LikesService {
  constructor(private readonly prisma: PrismaService) {}
  async likeContent(uuid: string, updateLikeDto: UpdateLikeDto) {
    const { liked_by } = updateLikeDto;

    const content = await this.prisma.contents.findUnique({
      where: { uuid },
    });

    if (!content) {
      throw new NotFoundException(`Content with UUID ${uuid} not found`);
    }

    const user = await this.prisma.users.findUnique({
      where: { uuid: liked_by },
    });

    if (!user) {
      throw new NotFoundException(`User with UUID ${liked_by} not found`);
    }

    const like = await this.prisma.likes.create({
      data: {
        content: { connect: { id: content.id } },
        user: { connect: { id: user.id } },
      },
    });

    return {
      status: 'success',
      message: 'Content liked successfully!',
      data: {
        uuid: like.uuid,
      },
    };
  }

  async unlikeContent(content_uuid: string, liked_by_uuid: string) {
    const content = await this.prisma.contents.findUnique({
      where: { uuid: content_uuid },
    });

    if (!content) {
      throw new NotFoundException(
        `Content with UUID ${content_uuid} not found`,
      );
    }

    const user = await this.prisma.users.findUnique({
      where: { uuid: liked_by_uuid },
    });

    if (!user) {
      throw new NotFoundException(`User with UUID ${liked_by_uuid} not found`);
    }

    const like = await this.prisma.likes.findFirst({
      where: {
        content_id: content.id,
        liked_by: user.id,
      },
    });

    if (!like) {
      throw new NotFoundException(
        `Like by user ${liked_by_uuid} on content ${content_uuid} not found`,
      );
    }

    await this.prisma.likes.delete({
      where: { id: like.id }, // Hapus like berdasarkan ID
    });

    return {
      status: 'success',
      message: 'Like removed successfully!',
      data: {
        uuid: like.uuid,
      },
    };
  }
}
