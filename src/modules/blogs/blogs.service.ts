import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UuidHelper } from 'src/common/helpers/uuid.helper';

@Injectable()
export class BlogsService {
  constructor(
    private prisma: PrismaService,
    private readonly uuidHelper: UuidHelper,
  ) {}

  async create(createBlogDto: CreateBlogDto) {
    const {
      title,
      thumbnail,
      description,
      subjects,
      category_uuid,
      author_uuid,
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
            author: { connect: { uuid: author_uuid } },
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
        Blogs: {
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
        updated_at: content.updated_at,
        category: content.category.name,
        author: content.Blogs[0].author.full_name,
        blog_content: content.Blogs[0].blog_content,
        published: content.Blogs[0].published,
        published_at: content.Blogs[0].published_at,
        tags: content.tags.map((tag) => ({
          id: tag.uuid,
          name: tag.name,
        })),
        comments: content.comments.map((comment) => ({
          id: comment.uuid,
          subject: comment.comment_content,
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

  async findOne(uuid: string) {
    const content = await this.prisma.contents.findUnique({
      where: { type: 'Blog', uuid },
      include: {
        category: true,
        tags: true,
        comments: true,
        likes: true,
        Blogs: {
          include: {
            author: true,
          },
        },
      },
    });

    if (!content) {
      throw new NotFoundException(`Blog with uuid ${uuid} does not exist`);
    }
    return {
      status: 'success',
      data: {
        id: content.uuid,
        thumbnail: content.thumbnail,
        title: content.title,
        description: content.description,
        subjects: content.subjects,
        updated_at: content.updated_at,
        category: content.category.name,
        author: content.Blogs[0].author.full_name,
        blog_content: content.Blogs[0].blog_content,
        published: content.Blogs[0].published,
        published_at: content.Blogs[0].published_at,
        tags: content.tags.map((tag) => ({
          id: tag.uuid,
          name: tag.name,
        })),
        comments: content.comments.map((comment) => ({
          id: comment.uuid,
          subject: comment.comment_content,
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

  async update(uuid: string, updateBlogDto: UpdateBlogDto) {
    const {
      title,
      thumbnail,
      description,
      subjects,
      category_uuid,
      author_uuid,
      blog_content,
      published,
      published_at,
    } = updateBlogDto;

    const content = await this.uuidHelper.validateUuidContent(uuid);
    const author = await this.uuidHelper.validateUuidCreator(author_uuid);
    const category = await this.uuidHelper.validateUuidCategory(category_uuid);

    const blog = await this.prisma.contents.update({
      where: {
        uuid: uuid,
        type: 'Blog',
      },
      data: {
        title,
        thumbnail,
        description,
        subjects,
        category: { connect: { id: category.id } },
        Blogs: {
          update: {
            where: { content_id: content.id },
            data: {
              author_id: author.id,
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
        id: blog.uuid,
      },
    };
  }

  async remove(uuid: string) {
    const isExists = await this.prisma.contents.findUnique({
      where: { uuid },
    });

    if (!isExists) {
      throw new NotFoundException(`Audio with UUID ${uuid} does not exist`);
    }

    const content = await this.prisma.contents.delete({
      where: { uuid: uuid, type: 'Blog' },
    });
    return {
      status: 'success',
      message: 'Blog succefully deleted',
      data: content.uuid,
    };
  }
}
