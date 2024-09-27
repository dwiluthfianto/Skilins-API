import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BlogsService {
  constructor(private prisma: PrismaService) {}

  async create(createBlogDto: CreateBlogDto) {
    const {
      title,
      thumbnail,
      description,
      subjects,
      category_uuid,
      author_id,
      blog_content,
      published,
      published_at,
    } = createBlogDto;

    const content = await this.prisma.contents.create({
      data: {
        type: 'Blog',
        title,
        thumbnail,
        description,
        subjects,
        category: { connect: { uuid: category_uuid } },
        Blogs: {
          create: {
            author: { connect: { uuid: author_id } },
            blog_content,
            published,
            published_at,
          },
        },
      },
    });

    return {
      status: 'success',
      message: 'Blog succefully added',
      data: {
        id: content.uuid,
      },
    };
  }

  async findAll() {
    const contents = await this.prisma.contents.findMany({
      where: { type: 'Blog' },
      include: {
        category: true,
        tags: true,
        comments: true,
        likes: true,
        Blogs: true,
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
        updated_at: content.updated_at,
        category: {
          id: content.category.uuid,
          name: content.category.name,
        },
        content: {
          id: content.Blogs[0].uuid,
          author_id: content.Blogs[0].author_id,
          blog_content: content.Blogs[0].blog_content,
          published: content.Blogs[0].published,
          published_at: content.Blogs[0].published_at,
        },
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
      where: { type: 'Blog', uuid: id },
      include: {
        category: true,
        tags: true,
        comments: true,
        likes: true,
        Blogs: true,
      },
    });

    return {
      status: 'success',
      data: {
        id: content.uuid,
        thumbnail: content.thumbnail,
        title: content.title,
        description: content.description,
        subjects: content.subjects,
        updated_at: content.updated_at,
        category: {
          id: content.category.uuid,
          name: content.category.name,
        },
        content: {
          id: content.Blogs[0].uuid,
          author_id: content.Blogs[0].author_id,
          blog_content: content.Blogs[0].blog_content,
          published: content.Blogs[0].published,
          published_at: content.Blogs[0].published_at,
        },
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

  async update(id: string, updateBlogDto: UpdateBlogDto) {
    const {
      title,
      thumbnail,
      description,
      subjects,
      category_uuid,
      author_id,
      blog_content,
      published,
      published_at,
    } = updateBlogDto;

    const isExists = await this.prisma.contents.findUnique({
      where: { uuid: id },
    });

    if (!isExists) {
      throw new NotFoundException(`Blog with Id ${id} does not exist`);
    }

    const content = await this.prisma.contents.update({
      where: {
        uuid: id,
        type: 'Blog',
      },
      data: {
        title,
        thumbnail,
        description,
        subjects,
        category: { connect: { uuid: category_uuid } },
        Blogs: {
          update: {
            where: { id: isExists.id },
            data: {
              author: { connect: { uuid: author_id } },
              blog_content,
              published,
              published_at,
            },
          },
        },
      },
    });

    return {
      status: 'success',
      message: 'Blog succefully updated',
      data: {
        id: content.uuid,
      },
    };
  }

  async remove(id: string) {
    const content = await this.prisma.contents.delete({
      where: { uuid: id, type: 'Blog' },
    });
    return {
      status: 'success',
      message: 'Blog succefully deleted',
      data: content.uuid,
    };
  }
}
