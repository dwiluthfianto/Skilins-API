import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UuidHelper } from 'src/common/helpers/uuid.helper';
import slugify from 'slugify';

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
      category_name,
      author_uuid,
      blog_content,
      published,
      published_at,
      genres,
    } = createBlogDto;

    let parsedGenres;

    if (Array.isArray(genres)) {
      parsedGenres = genres;
    } else if (typeof genres === 'string') {
      try {
        parsedGenres = JSON.parse(genres);
      } catch (error) {
        console.error('Failed to parse genres:', error);
        throw new Error('Invalid JSON format for genres');
      }
    } else {
      parsedGenres = [];
    }

    let parsedSubjects;
    if (Array.isArray(subjects)) {
      parsedSubjects = subjects;
    } else if (typeof subjects === 'string') {
      try {
        parsedSubjects = JSON.parse(subjects);
      } catch (error) {
        console.error('Failed to parse subjects:', error);
        throw new Error('Invalid JSON format for subjects');
      }
    } else {
      parsedSubjects = [];
    }

    const content = await this.prisma.contents.create({
      data: {
        type: 'Blog',
        title,
        thumbnail,
        description,
        slug: slugify(title, {
          lower: true,
          strict: true,
          remove: /[*+~.()'"!:@]/g,
        }),
        subjects: parsedSubjects,
        category: { connect: { uuid: category_name } },
        Blogs: {
          create: {
            author: { connect: { uuid: author_uuid } },
            blog_content,
            published,
            published_at,
          },
        },
        Genres: {
          connectOrCreate: parsedGenres?.map((genre) => ({
            where: { name: genre.name },
            create: {
              name: genre.name,
              avatar_url:
                genre.avatar_url ||
                'https://images.unsplash.com/photo-1494537176433-7a3c4ef2046f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
              description: genre.description || 'No description available.',
            },
          })),
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

  async findAll(page: number, limit: number) {
    const contents = await this.prisma.contents.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: { type: 'Blog' },
      include: {
        category: true,
        Blogs: {
          include: {
            author: true,
          },
        },
      },
    });

    const total = await this.prisma.blogs.count();

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
      })),
      totalPages: total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findByCategory(page: number, limit: number, category: string) {
    const contents = await this.prisma.contents.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        type: 'Ebook',
        category: {
          name: {
            equals: category,
            mode: 'insensitive',
          },
        },
      },
      include: {
        category: true,
        Blogs: {
          include: {
            author: true,
          },
        },
      },
    });

    const total = await this.prisma.blogs.count();

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
      })),
      totalPages: total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findByGenre(page: number, limit: number, genre: string) {
    const contents = await this.prisma.contents.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        type: 'Ebook',
        Genres: {
          some: {
            name: {
              equals: genre,
              mode: 'insensitive',
            },
          },
        },
      },
      include: {
        category: true,
        Blogs: {
          include: {
            author: true,
          },
        },
      },
    });

    const total = await this.prisma.blogs.count();

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
      })),
      totalPages: total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findLatest(page: number, limit: number, week: number) {
    const currentDate = new Date();
    const oneWeekAgo = new Date();
    const weeks = week * 7;
    oneWeekAgo.setDate(currentDate.getDate() - weeks);
    const contents = await this.prisma.contents.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        type: 'Ebook',
        created_at: {
          gte: oneWeekAgo,
          lte: currentDate,
        },
      },
      orderBy: {
        id: 'asc',
      },
      include: {
        category: true,
        Blogs: {
          include: {
            author: true,
          },
        },
      },
    });

    const total = await this.prisma.blogs.count();
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
      })),
      totalPages: total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(uuid: string) {
    const content = await this.prisma.contents.findUniqueOrThrow({
      where: { type: 'Blog', uuid },
      include: {
        category: true,
        Genres: true,
        Comments: {
          include: {
            user: {
              select: {
                uuid: true,
                full_name: true,
                profile_url: true,
              },
            },
          },
        },
        Blogs: {
          include: {
            author: true,
          },
        },
      },
    });

    const avg_rating = await this.prisma.ratings.aggregate({
      where: { content_id: content.id },
      _avg: {
        rating_value: true,
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
        category: content.category.name,
        author: content.Blogs[0].author.full_name,
        blog_content: content.Blogs[0].blog_content,
        published: content.Blogs[0].published,
        published_at: content.Blogs[0].published_at,
        genres: content.Genres.map((genre) => ({
          uuid: genre.uuid,
          name: genre.name,
        })),
        comments: content.Comments.map((comment) => ({
          uuid: comment.uuid,
          subject: comment.comment_content,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          commented_by_uuid: comment.user.uuid,
          commented_by: comment.user.full_name,
          profile: comment.user.profile_url,
        })),
        avg_rating,
      },
    };
  }

  async update(uuid: string, updateBlogDto: UpdateBlogDto) {
    const {
      title,
      thumbnail,
      description,
      subjects,
      category_name,
      author_uuid,
      blog_content,
      published,
      published_at,
      genres,
    } = updateBlogDto;

    const content = await this.uuidHelper.validateUuidContent(uuid);
    const author = await this.uuidHelper.validateUuidCreator(author_uuid);
    const category = await this.uuidHelper.validateUuidCategory(category_name);

    let parsedGenres;

    if (Array.isArray(genres)) {
      parsedGenres = genres;
    } else if (typeof genres === 'string') {
      try {
        parsedGenres = JSON.parse(genres);
      } catch (error) {
        console.error('Failed to parse genres:', error);
        throw new Error('Invalid JSON format for genres');
      }
    } else {
      parsedGenres = [];
    }

    let parsedSubjects;
    if (Array.isArray(subjects)) {
      parsedSubjects = subjects;
    } else if (typeof subjects === 'string') {
      try {
        parsedSubjects = JSON.parse(subjects);
      } catch (error) {
        console.error('Failed to parse subjects:', error);
        throw new Error('Invalid JSON format for subjects');
      }
    } else {
      parsedSubjects = [];
    }

    const blog = await this.prisma.contents.update({
      where: {
        uuid: uuid,
        type: 'Blog',
      },
      data: {
        title,
        thumbnail,
        description,
        subjects: parsedSubjects,
        slug: slugify(title, {
          lower: true,
          strict: true,
          remove: /[*+~.()'"!:@]/g,
        }),
        category: { connect: { uuid: category.uuid } },
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
        Genres: {
          connectOrCreate: parsedGenres?.map((genre) => ({
            where: { name: genre.name },
            create: {
              name: genre.name,
              avatar_url:
                genre.avatar_url ||
                'https://images.unsplash.com/photo-1494537176433-7a3c4ef2046f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
              description: genre.description || 'No description available.',
            },
          })),
        },
      },
    });

    return {
      status: 'success',
      message: 'Blog updated successfully',
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
      data: { uuid: content.uuid },
    };
  }
}
