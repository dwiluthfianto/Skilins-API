import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
// import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(uuid: string, createCommentDto: CreateCommentDto) {
    const { commented_by, comment_content } = createCommentDto;
    const content = await this.prisma.contents.findUniqueOrThrow({
      where: { uuid },
    });

    const user = await this.prisma.users.findUniqueOrThrow({
      where: { uuid: commented_by },
    });

    const comment = await this.prisma.comments.create({
      data: {
        comment_content,
        content: { connect: { id: content.id } },
        user: { connect: { id: user.id } },
      },
    });
    return {
      status: 'success',
      data: {
        uuid: comment.uuid,
      },
    };
  }

  // update(id: number, updateCommentDto: UpdateCommentDto) {
  //   return `This action updates a #${id} comment`;
  // }

  async remove(content_uuid: string, comment_by_uuid: string) {
    const content = await this.prisma.contents.findUniqueOrThrow({
      where: { uuid: content_uuid },
    });

    const user = await this.prisma.users.findUniqueOrThrow({
      where: { uuid: comment_by_uuid },
    });

    const comment = await this.prisma.comments.findFirstOrThrow({
      where: {
        content_id: content.id,
        commented_by: user.id,
      },
    });

    await this.prisma.comments.delete({
      where: { id: comment.id }, // Hapus like berdasarkan ID
    });

    return {
      status: 'success',
      message: 'Comment removed successfully!',
      data: {
        uuid: comment.uuid,
      },
    };
  }
}
