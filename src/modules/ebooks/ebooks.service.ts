import { Injectable } from '@nestjs/common';
import { CreateEbookDto } from './dto/create-ebook.dto';
import { UpdateEbookDto } from './dto/update-ebook.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UuidHelper } from 'src/common/helpers/uuid.helper';
import { SlugHelper } from 'src/common/helpers/generate-unique-slug';
import { ContentStatus } from '@prisma/client';
import parseArrayInput from 'src/common/utils/parse-array';

@Injectable()
export class EbooksService {
  constructor(
    private prisma: PrismaService,
    private readonly uuidHelper: UuidHelper,
    private readonly slugHelper: SlugHelper,
  ) {}

  async create(createContentDto: CreateEbookDto) {
    const {
      title,
      thumbnail,
      description,
      tags,
      category_name,
      author,
      pages,
      publication,
      file_url,
      isbn,
      release_date,
      genres,
    } = createContentDto;

    const parsedGenres = parseArrayInput(genres);
    const parsedTags = parseArrayInput(tags);
    const newSlug = await this.slugHelper.generateUniqueSlug(title);
    const content = await this.prisma.contents.create({
      data: {
        type: 'EBOOK',
        title,
        thumbnail,
        description,
        status: ContentStatus.APPROVED,
        slug: newSlug,
        Tags: {
          connect: parsedTags?.map((tag) => ({
            name: tag.text,
          })),
        },
        category: { connect: { name: category_name } },
        Ebooks: {
          create: {
            author: author,
            pages: pages,
            publication: publication,
            file_url: file_url,
            isbn: isbn,
            release_date: release_date,
          },
        },
        Genres: {
          connect: parsedGenres?.map((tag) => ({
            name: tag.text,
          })),
        },
      },
    });

    return {
      status: 'success',
      message: 'EBOOK added successfully.',
      data: {
        uuid: content.uuid,
      },
    };
  }

  async fetchEbooks(page?: number, limit?: number, filter: object = {}) {
    const contents = await this.prisma.contents.findMany({
      ...(page && limit ? { skip: (page - 1) * limit, take: limit } : {}),
      where: {
        type: 'EBOOK',
        ...filter,
      },
      include: {
        category: true,
        Ratings: true,
        Tags: true,
        Genres: true,
        Ebooks: true,
      },
    });

    const total = await this.prisma.ebooks.count();

    const data = await Promise.all(
      contents.map(async (content) => {
        // Calculate average rating for each content
        const avgRatingResult = await this.prisma.ratings.aggregate({
          where: { content_id: content.id },
          _avg: {
            rating_value: true,
          },
        });
        const avg_rating = avgRatingResult._avg.rating_value || 0;

        return {
          uuid: content.uuid,
          thumbnail: content.thumbnail,
          title: content.title,
          description: content.description,
          slug: content.slug,
          tags: content.Tags.map((tag) => ({
            id: tag.uuid,
            text: tag.name,
          })),
          genres: content.Genres.map((tag) => ({
            id: tag.uuid,
            text: tag.name,
          })),
          created_at: content.created_at,
          updated_at: content.updated_at,
          category: content.category.name,
          author: content.Ebooks[0]?.author,
          pages: content.Ebooks[0]?.pages,
          publication: content.Ebooks[0]?.publication,
          file_url: content.Ebooks[0]?.file_url,
          isbn: content.Ebooks[0]?.isbn,
          release_date: content.Ebooks[0]?.release_date,
          avg_rating,
        };
      }),
    );

    return { data, total };
  }

  async getPaginatedResponse(
    page: number,
    limit: number,
    total: number,
    data: any[],
  ) {
    return {
      status: 'success',
      data,
      totalPages: limit ? Math.ceil(total / limit) : 1,
      page: page || 1,
      lastPage: limit ? Math.ceil(total / limit) : 1,
    };
  }

  async findAll(page?: number, limit?: number, search: string = '') {
    const filter = {
      title: {
        contains: search,
        mode: 'insensitive',
      },
    };
    const { data, total } = await this.fetchEbooks(page, limit, filter);
    return this.getPaginatedResponse(page, limit, total, data);
  }

  async findByCategory(page: number, limit: number, category: string) {
    const filter = {
      category: {
        name: {
          equals: category,
          mode: 'insensitive',
        },
      },
    };
    const { data, total } = await this.fetchEbooks(page, limit, filter);
    return this.getPaginatedResponse(page, limit, total, data);
  }

  async findByGenre(page: number, limit: number, genre: string) {
    const filter = {
      Genres: {
        some: {
          name: {
            equals: genre,
            mode: 'insensitive',
          },
        },
      },
    };
    const { data, total } = await this.fetchEbooks(page, limit, filter);
    return this.getPaginatedResponse(page, limit, total, data);
  }

  async findByTag(page: number, limit: number, tag: string) {
    const filter = {
      Tags: {
        some: {
          name: {
            equals: tag,
            mode: 'insensitive',
          },
        },
      },
    };
    const { data, total } = await this.fetchEbooks(page, limit, filter);
    return this.getPaginatedResponse(page, limit, total, data);
  }

  async findLatest(
    page: number,
    limit: number,
    week: number,
    status: string = ContentStatus.APPROVED,
  ) {
    const currentDate = new Date();
    const weeks = week * 7;
    const oneWeekAgo = new Date(
      currentDate.getTime() - weeks * 24 * 60 * 60 * 1000,
    );

    const filter = {
      status: status as ContentStatus,
      created_at: {
        gte: oneWeekAgo,
        lte: currentDate,
      },
    };
    const { data, total } = await this.fetchEbooks(page, limit, filter);
    return this.getPaginatedResponse(page, limit, total, data);
  }

  async findOne(uuid: string) {
    const content = await this.prisma.contents.findUniqueOrThrow({
      where: { type: 'EBOOK', uuid },
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
        Tags: true,
        Ratings: true,
        Ebooks: true,
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
        uuid: content.uuid,
        thumbnail: content.thumbnail,
        title: content.title,
        description: content.description,
        slug: content.slug,
        tags: content.Tags.map((tag) => ({
          id: tag.uuid,
          text: tag.name,
        })),
        created_at: content.created_at,
        updated_at: content.updated_at,
        category: content.category.name,
        author: content.Ebooks[0].author,
        pages: content.Ebooks[0].pages,
        publication: content.Ebooks[0].publication,
        file_url: content.Ebooks[0].file_url,
        isbn: content.Ebooks[0].isbn,
        release_date: content.Ebooks[0].release_date,
        genres: content.Genres.map((genre) => ({
          id: genre.uuid,
          text: genre.name,
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
        avg_rating: avg_rating._avg.rating_value,
      },
    };
  }
  async findOneBySlug(slug: string) {
    const content = await this.prisma.contents.findUniqueOrThrow({
      where: { type: 'EBOOK', slug },
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
        Tags: true,
        Ratings: true,
        Ebooks: true,
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
        uuid: content.uuid,
        thumbnail: content.thumbnail,
        title: content.title,
        description: content.description,
        slug: content.slug,
        tags: content.Tags.map((tag) => ({
          id: tag.uuid,
          text: tag.name,
        })),
        created_at: content.created_at,
        updated_at: content.updated_at,
        category: content.category.name,
        author: content.Ebooks[0].author,
        pages: content.Ebooks[0].pages,
        publication: content.Ebooks[0].publication,
        file_url: content.Ebooks[0].file_url,
        isbn: content.Ebooks[0].isbn,
        release_date: content.Ebooks[0].release_date,
        genres: content.Genres.map((genre) => ({
          id: genre.uuid,
          text: genre.name,
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
        avg_rating: avg_rating._avg.rating_value,
      },
    };
  }

  async update(uuid: string, updateContentDto: UpdateEbookDto) {
    const {
      title,
      thumbnail,
      description,
      tags,
      category_name,
      author,
      pages,
      publication,
      file_url,
      isbn,
      release_date,
      genres,
    } = updateContentDto;

    const content = await this.uuidHelper.validateUuidContent(uuid);
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

    let parsedTags;
    if (Array.isArray(tags)) {
      parsedTags = tags;
    } else if (typeof tags === 'string') {
      try {
        parsedTags = JSON.parse(tags);
      } catch (error) {
        console.error('Failed to parse tags:', error);
        throw new Error('Invalid JSON format for tags');
      }
    } else {
      parsedTags = [];
    }

    const newSlug = await this.slugHelper.generateUniqueSlug(title);
    const ebook = await this.prisma.contents.update({
      where: { uuid, type: 'EBOOK' },
      data: {
        title,
        thumbnail,
        description,
        Tags: {
          connect: parsedTags?.map((tag) => ({
            name: tag.text,
          })),
        },
        slug: newSlug,
        category: { connect: { uuid: category.uuid } },
        Ebooks: {
          update: {
            where: { content_id: content.id },
            data: { author, pages, publication, file_url, isbn, release_date },
          },
        },
        Genres: {
          connect: parsedGenres?.map((genre) => ({
            name: genre.text,
          })),
        },
      },
    });

    return {
      status: 'success',
      message: 'EBOOK updated succesfully.',
      data: {
        uuid: ebook.uuid,
      },
    };
  }

  async remove(uuid: string) {
    await this.uuidHelper.validateUuidContent(uuid);

    const ebook = await this.prisma.contents.delete({
      where: { uuid, type: 'EBOOK' },
    });

    return {
      status: 'success',
      message: 'EBOOK deleted succesfully .',
      data: {
        uuid: ebook.uuid,
      },
    };
  }
}
