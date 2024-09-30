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
      category_uuid,
    } = createPklReportDto;

    const report = await this.prisma.contents.create({
      data: {
        type: 'PklReport',
        title,
        thumbnail,
        description,
        subjects,
        category: { connect: { uuid: category_uuid } },
        PklReports: {
          create: {
            author: { connect: { uuid: author_uuid } },
            pages,
            file_url,
            published_at,
          },
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
            author: true,
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
        creator: report.PklReports[0].author.name,
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
    const report = await this.prisma.contents.findUnique({
      where: { uuid, type: 'PklReport' },
      include: {
        category: true,
        tags: true,
        likes: true,
        comments: true,
        PklReports: {
          include: {
            author: true,
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
        creator: report.PklReports[0].author.name,
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
      category_uuid,
    } = updatePklReportDto;
    const content = await this.uuidHelper.validateUuidContent(uuid);
    const author = await this.uuidHelper.validateUuidCreator(author_uuid);
    const category = await this.uuidHelper.validateUuidCategory(category_uuid);

    const report = await this.prisma.contents.update({
      where: { uuid },
      data: {
        title,
        thumbnail,
        description,
        subjects,
        category: { connect: { id: category.id } },
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
      where: { uuid: uuid },
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
