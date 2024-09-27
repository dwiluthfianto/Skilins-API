import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNovelDto } from './dto/create-novel.dto';
import { UpdateNovelDto } from './dto/update-novel.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NovelsService {
  constructor(private prisma: PrismaService) {}

  async create(createNovelDto: CreateNovelDto) {
    const {
      title,
      thumbnail,
      description,
      subjects,
      category_uuid,
      author_id,
      pages,
      file_url,
    } = createNovelDto;

    // // Cari author_id berdasarkan uuid
    // const author = await this.prisma.students.findUnique({
    //   where: { uuid: author_id },
    //   select: { id: true }, // Ambil author_id (id)
    // });

    // if (!author) {
    //   throw new Error('Author not found');
    // }

    const content = await this.prisma.contents.create({
      data: {
        type: 'Novel',
        title,
        thumbnail,
        description,
        subjects,
        category: { connect: { uuid: category_uuid } },
        Novel: {
          create: {
            author: { connect: { uuid: author_id } },
            pages,
            file_url,
          },
        },
      },
    });

    return {
      status: 'success',
      message: 'Novel succesfully added.',
      data: {
        id: content.uuid,
      },
    };
  }

  async findAll() {
    const contents = await this.prisma.contents.findMany({
      where: { type: 'Novel' },
      include: {
        category: true,
        tags: true,
        likes: true,
        comments: true,
        Novel: {
          include: {
            author: true,
          },
        },
      },
    });

    return {
      status: 'success',
      data: contents.map((content) => ({
        id: content.uuid,
        thumbnail: content.thumbnail,
        title: content.title,
        description: content.description,
        subjects: content.subjects,
        create_at: content.created_at,
        updated_at: content.updated_at,
        category: content.category.name,
        author: content.Novel[0].author.name,
        pages: content.Novel[0].pages,
        file_url: content.Novel[0].file_url,
        tags: content.tags.map((tag) => ({
          id: tag.uuid,
          name: tag.name,
        })),
        comments: content.comments.map((comment) => ({
          id: comment.uuid,
          subject: comment.subject,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          commented_by: comment.commented_by,
        })),
        likes: content.likes.map((like) => ({
          id: like.uuid,
          created_at: like.created_at,
          liked_by: like.liked_by,
        })),
      })),
    };
  }

  async findOne(id: string) {
    const content = await this.prisma.contents.findUnique({
      where: { uuid: id, type: 'Novel' },
      include: {
        category: true,
        tags: true,
        likes: true,
        comments: true,
        Novel: {
          include: {
            author: true,
          },
        },
      },
    });

    if (!content) {
      throw new NotFoundException(`Eovel with ID ${id} does not exist.`);
    }

    return {
      status: 'success',
      data: {
        id: content.uuid,
        thumbnail: content.thumbnail,
        title: content.title,
        description: content.description,
        subjects: content.subjects,
        create_at: content.created_at,
        updated_at: content.updated_at,
        category: content.category.name,
        author: content.Novel[0].author.name,
        pages: content.Novel[0].pages,
        file_url: content.Novel[0].file_url,
        tags: content.tags.map((tag) => ({
          id: tag.uuid,
          name: tag.name,
        })),
        comments: content.comments.map((comment) => ({
          id: comment.uuid,
          subject: comment.subject,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          commented_by: comment.commented_by,
        })),
        likes: content.likes.map((like) => ({
          id: like.uuid,
          created_at: like.created_at,
          liked_by: like.liked_by,
        })),
      },
    };
  }

  async update(id: string, updateNovelDto: UpdateNovelDto) {
    const {
      title,
      thumbnail,
      description,
      subjects,
      category_uuid,
      pages,
      file_url,
    } = updateNovelDto;

    const isExists = await this.prisma.contents.findUnique({
      where: { uuid: id, type: 'Novel' },
    });

    if (!isExists) {
      throw new NotFoundException(`Novel with ID ${id} does not exist.`);
    }

    const content = await this.prisma.contents.update({
      where: {
        uuid: id,
        type: 'Novel',
      },
      data: {
        title,
        thumbnail,
        description,
        subjects,
        category: { connect: { uuid: category_uuid } },
        Novel: {
          update: {
            where: { content_id: isExists.id },
            data: {
              pages,
              file_url,
            },
          },
        },
      },
    });

    return {
      status: 'success',
      message: 'Novel succesfully updated.',
      data: {
        id: content.uuid,
      },
    };
  }

  async remove(id: string) {
    const isExists = await this.prisma.contents.findUnique({
      where: { uuid: id, type: 'Novel' },
    });

    if (!isExists) {
      throw new NotFoundException(`Novel with ID ${id} not found.`);
    }

    const content = await this.prisma.contents.delete({
      where: { uuid: id, type: 'Novel' },
    });

    return {
      status: 'success',
      message: 'Novel have been removed',
      data: {
        id: content.uuid,
      },
    };
  }
}
