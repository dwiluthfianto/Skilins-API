import { Injectable } from '@nestjs/common';
import { UpdateLikeDto } from './dto/update-like.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LikesService {
  constructor(private readonly prisma: PrismaService) {}
  async likeContent(uuid: string, updateLikeDto: UpdateLikeDto) {
    const { liked_by } = updateLikeDto;

    const content = await this.prisma.contents.findUniqueOrThrow({
      where: { uuid },
    });

    const user = await this.prisma.users.findUniqueOrThrow({
      where: { uuid: liked_by },
    });

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
  async isLiked(uuid: string, liked_by: string) {
    const content = await this.prisma.contents.findUniqueOrThrow({
      where: { uuid },
    });

    const user = await this.prisma.users.findUniqueOrThrow({
      where: { uuid: liked_by },
    });

    await this.prisma.likes.findFirstOrThrow({
      where: {
        content_id: content.id,
        liked_by: user.id,
      },
    });

    return {
      status: 'success',
      message: 'Content liked successfully!',
      data: {
        liked: true,
      },
    };
  }

  async unlikeContent(content_uuid: string, liked_by_uuid: string) {
    const content = await this.prisma.contents.findUniqueOrThrow({
      where: { uuid: content_uuid },
    });

    const user = await this.prisma.users.findUniqueOrThrow({
      where: { uuid: liked_by_uuid },
    });

    const like = await this.prisma.likes.findFirstOrThrow({
      where: {
        content_id: content.id,
        liked_by: user.id,
      },
    });

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
