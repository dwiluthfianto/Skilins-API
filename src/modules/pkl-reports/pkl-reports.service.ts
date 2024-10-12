import { Injectable } from '@nestjs/common';
import { CreatePklReportDto } from './dto/create-pkl-report.dto';
import { UpdatePklReportDto } from './dto/update-pkl-report.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UuidHelper } from 'src/common/helpers/uuid.helper';

@Injectable()
export class PklReportsService {
  constructor(
    private prisma: PrismaService,
    private readonly uuidHelper: UuidHelper,
  ) {}
  async create(createPklReportDto: CreatePklReportDto) {
    const {
      title,
      thumbnail,
      description,
      subjects,
      pages,
      file_url,
      published_at,
      author_uuid,
      category_name,
      tags,
    } = createPklReportDto;

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

    const report = await this.prisma.contents.create({
      data: {
        type: 'PklReport',
        title,
        thumbnail,
        description,
        subjects: parsedSubjects,
        category: { connect: { name: category_name } },
        PklReports: {
          create: {
            author: { connect: { uuid: author_uuid } },
            pages,
            file_url,
            published_at,
          },
        },
        tags: {
          connectOrCreate: parsedTags?.map((tag) => ({
            where: { name: tag.name },
            create: {
              name: tag.name,
              avatar_url:
                tag.avatar_url ||
                'https://images.unsplash.com/photo-1494537176433-7a3c4ef2046f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
              description: tag.description || 'No description available.',
            },
          })),
        },
      },
    });

    return {
      status: 'success',
      message: 'pkl report successfully added!',
      data: {
        uuid: report.uuid,
      },
    };
  }

  async findAll() {
    const reports = await this.prisma.contents.findMany({
      where: { type: 'PklReport' },
      include: {
        category: true,
        tags: true,
        likes: true,
        comments: true,
        PklReports: {
          include: {
            author: {
              include: {
                major: true,
              },
            },
          },
        },
      },
    });

    return {
      status: 'success',
      data: reports.map((report) => ({
        uuid: report.uuid,
        thumbnail: report.thumbnail,
        title: report.title,
        description: report.description,
        subjects: report.subjects,
        create_at: report.created_at,
        updated_at: report.updated_at,
        category: report.category.name,
        author: report.PklReports[0].author.name,
        major: report.PklReports[0].author.major.name,
        pages: report.PklReports[0].pages,
        file_url: report.PklReports[0].file_url,
        published_at: report.PklReports[0].published_at,
        tags: report.tags.map((tag) => ({
          uuid: tag.uuid,
          name: tag.name,
        })),
        comments: report.comments.map((comment) => ({
          uuid: comment.uuid,
          subject: comment.comment_content,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          commented_by: comment.commented_by,
        })),
        likes: report.likes.map((like) => ({
          uuid: like.uuid,
          created_at: like.created_at,
          liked_by: like.liked_by,
        })),
      })),
    };
  }

  async findOne(uuid: string) {
    await this.uuidHelper.validateUuidContent(uuid);
    const report = await this.prisma.contents.findUniqueOrThrow({
      where: { uuid, type: 'PklReport' },
      include: {
        category: true,
        tags: true,
        likes: true,
        comments: true,
        PklReports: {
          include: {
            author: {
              include: {
                major: true,
              },
            },
          },
        },
      },
    });

    return {
      status: 'success',
      data: {
        uuid: report.uuid,
        thumbnail: report.thumbnail,
        title: report.title,
        description: report.description,
        subjects: report.subjects,
        create_at: report.created_at,
        updated_at: report.updated_at,
        category: report.category.name,
        author: report.PklReports[0].author.name,
        major: report.PklReports[0].author.major.name,
        pages: report.PklReports[0].pages,
        file_url: report.PklReports[0].file_url,
        published_at: report.PklReports[0].published_at,
        tags: report.tags.map((tag) => ({
          uuid: tag.uuid,
          name: tag.name,
        })),
        comments: report.comments.map((comment) => ({
          uuid: comment.uuid,
          subject: comment.comment_content,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          commented_by: comment.commented_by,
        })),
        likes: report.likes.map((like) => ({
          uuid: like.uuid,
          created_at: like.created_at,
          liked_by: like.liked_by,
        })),
      },
    };
  }

  async update(uuid: string, updatePklReportDto: UpdatePklReportDto) {
    const {
      title,
      thumbnail,
      description,
      subjects,
      pages,
      file_url,
      published_at,
      author_uuid,
      category_name,
      tags,
    } = updatePklReportDto;
    const content = await this.uuidHelper.validateUuidContent(uuid);
    const author = await this.uuidHelper.validateUuidCreator(author_uuid);
    const category = await this.uuidHelper.validateUuidCategory(category_name);

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

    const report = await this.prisma.contents.update({
      where: { uuid },
      data: {
        title,
        thumbnail,
        description,
        subjects: parsedSubjects,
        category: { connect: { name: category.name } },
        PklReports: {
          update: {
            where: { content_id: content.id },
            data: {
              author_id: author.id,
              pages,
              file_url,
              published_at,
            },
          },
        },
        tags: {
          connectOrCreate: parsedTags?.map((tag) => ({
            where: { name: tag.name },
            create: {
              name: tag.name,
              avatar_url:
                tag.avatar_url ||
                'https://images.unsplash.com/photo-1494537176433-7a3c4ef2046f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
              description: tag.description || 'No description available.',
            },
          })),
        },
      },
    });

    return {
      status: 'success',
      message: 'pkl report successfully deleted!',
      data: {
        uuid: report.uuid,
      },
    };
  }

  async remove(uuid: string) {
    await this.uuidHelper.validateUuidContent(uuid);

    const report = await this.prisma.contents.delete({
      where: { uuid },
    });
    return {
      status: 'success',
      message: 'audio successfully deleted!',
      data: {
        uuid: report.uuid,
      },
    };
  }
}
