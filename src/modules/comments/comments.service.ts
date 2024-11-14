import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
// import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { DeleteCommentDto } from './dto/delete-comment.dto';

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

  async remove(contentUuid: string, deleteCommentDto: DeleteCommentDto) {
    const content = await this.prisma.contents.findUniqueOrThrow({
      where: { uuid: contentUuid },
    });

    const user = await this.prisma.users.findUniqueOrThrow({
      where: { uuid: deleteCommentDto.commentBy },
    });

    const comment = await this.prisma.comments.findUniqueOrThrow({
      where: {
        content_id: content.id,
        commented_by: user.id,
        uuid: deleteCommentDto.commentUuid,
      },
      select: {
        uuid: true,
      },
    });

    await this.prisma.comments.delete({
      where: { uuid: comment.uuid },
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
