import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { UpdateCompetitionDto } from './dto/update-competition.dto';

import { SlugHelper } from 'src/common/helpers/generate-unique-slug';
import parseArrayInput from 'src/common/utils/parse-array';
import { ContentStatus, ContentType, Prisma } from '@prisma/client';

@Injectable()
export class CompetitionsService {
  private readonly logger = new Logger(CompetitionsService.name);
  constructor(
    private prisma: PrismaService,
    private readonly slugHelper: SlugHelper,
  ) {}

  async createCompetition(data: CreateCompetitionDto) {
    const newSlug = await this.slugHelper.generateUniqueSlugCompe(data.title);

    const judge_uuids = parseArrayInput(data.judge_uuids);

    const competition = await this.prisma.competitions.create({
      data: {
        thumbnail: data.thumbnail,
        title: data.title,
        slug: newSlug,
        type: data.type,
        description: data.description,
        guide: data.guide,
        start_date: data.start_date,
        end_date: data.end_date,
        submission_deadline: data.submission_deadline,
      },
    });

    if (judge_uuids && judge_uuids.length > 0) {
      const updateOperations: Prisma.PrismaPromise<any>[] = [];

      for (const judge_uuid of judge_uuids) {
        const user = await this.prisma.users.findUniqueOrThrow({
          where: { uuid: judge_uuid.id },
          select: { Judges: { select: { uuid: true } } },
        });

        updateOperations.push(
          this.prisma.judges.update({
            where: { uuid: user.Judges[0].uuid },
            data: {
              competition: { connect: { uuid: competition.uuid } },
            },
          }),
        );
      }

      await this.prisma.$transaction(updateOperations);
    }

    return {
      status: 'success',
      message: 'Competition Added Successfully!',
      data: {
        uuid: competition.uuid,
      },
    };
  }

  async updateCompetition(uuid: string, data: UpdateCompetitionDto) {
    const newSlug = await this.slugHelper.generateUniqueSlug(data.title);
    const judge_uuids = parseArrayInput(data.judge_uuids);
    const competition = await this.prisma.competitions.update({
      where: { uuid },
      data: {
        thumbnail: data.thumbnail,
        title: data.title,
        slug: newSlug,
        type: data.type,
        description: data.description,
        guide: data.guide,
        start_date: data.start_date,
        end_date: data.end_date,
        submission_deadline: data.submission_deadline,
      },
    });

    if (judge_uuids && judge_uuids.length > 0) {
      const updateOperations: Prisma.PrismaPromise<any>[] = [];

      for (const judge_uuid of judge_uuids) {
        const user = await this.prisma.users.findUniqueOrThrow({
          where: { uuid: judge_uuid.id },
          select: { Judges: { select: { uuid: true } } },
        });

        updateOperations.push(
          this.prisma.judges.update({
            where: { uuid: user.Judges[0].uuid },
            data: {
              competition: { connect: { uuid: competition.uuid } },
            },
          }),
        );
      }

      await this.prisma.$transaction(updateOperations);
    }

    return {
      status: 'success',
      message: 'Competition updated successfully!',
      data: {
        uuid: competition.uuid,
      },
    };
  }

  async fetchCompetitions(page: number, limit: number, filter: object = {}) {
    const competitions = await this.prisma.competitions.findMany({
      ...(page && limit ? { skip: (page - 1) * limit, take: limit } : {}),
      where: {
        ...filter,
      },
    });
    const data = competitions.map((competition) => ({
      uuid: competition.uuid,
      thumbnail: competition.thumbnail,
      title: competition.title,
      slug: competition.slug,
      type: competition.type,
      start_date: competition.start_date,
      end_date: competition.end_date,
      submission_deadline: competition.submission_deadline,
    }));

    const total = await this.prisma.competitions.count();

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

  async getAllCompetitions(page?: number, limit?: number, search: string = '') {
    const filter = {
      title: {
        contains: search,
        mode: 'insensitive',
      },
    };
    const { data, total } = await this.fetchCompetitions(page, limit, filter);
    return this.getPaginatedResponse(page, limit, total, data);
  }

  async getCompetitionByType(page?: number, limit?: number, type: string = '') {
    const filter = {
      type: {
        contains: type,
        mode: 'insensitive',
      },
    };
    const { data, total } = await this.fetchCompetitions(page, limit, filter);
    return this.getPaginatedResponse(page, limit, total, data);
  }

  async getActiveCompetitions(
    page?: number,
    limit?: number,
    search: string = '',
  ) {
    const filter = {
      title: {
        contains: search,
        mode: 'insensitive',
      },
      end_date: {
        gte: new Date(),
      },
    };
    const { data, total } = await this.fetchCompetitions(page, limit, filter);
    return this.getPaginatedResponse(page, limit, total, data);
  }

  async getFinishedCompetitions(
    page?: number,
    limit?: number,
    search: string = '',
  ) {
    const filter = {
      title: {
        contains: search,
        mode: 'insensitive',
      },
      end_date: {
        lt: new Date(),
      },
    };
    const { data, total } = await this.fetchCompetitions(page, limit, filter);
    return this.getPaginatedResponse(page, limit, total, data);
  }

  async getCompetitionBySlug(
    slug: string,
    type: string,
    status: string = ContentStatus.APPROVED,
  ) {
    const competition = await this.prisma.competitions.findUniqueOrThrow({
      where: { slug, type: type.toUpperCase() as ContentType },
      include: {
        Submissions: {
          where: {
            content: {
              status: status as ContentStatus,
            },
          },
          select: {
            id: false,
            student_id: false,
            content_id: false,
            competition_id: false,
            uuid: true,
            content: {
              select: {
                uuid: true,
                type: true,
                title: true,
                thumbnail: true,
                slug: true,
              },
            },
          },
        },
        Judges: {
          select: {
            uuid: true,
            user: {
              select: {
                profile_url: true,
                full_name: true,
              },
            },
            role: true,
            linkedin: true,
            instagram: true,
          },
        },
        Winners: {
          include: {
            submission: {
              select: {
                content: {
                  select: {
                    title: true,
                  },
                },
                student: {
                  select: {
                    name: true,
                    major: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return {
      status: 'success',
      data: competition,
    };
  }

  async getCompetitionByUuid(uuid: string) {
    const competition = await this.prisma.competitions.findUniqueOrThrow({
      where: { uuid },
      include: {
        Submissions: {
          include: { student: true, content: true },
        },
        Judges: true,
        Winners: true,
      },
    });

    return {
      status: 'success',
      data: competition,
    };
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async determineWinnersForEndedCompetitions() {
    const today = new Date();

    // Mencari kompetisi yang sudah berakhir dan belum ada pemenangnya
    const endedCompetitions = await this.prisma.competitions.findMany({
      where: {
        end_date: { lte: today },
        Winners: { none: {} },
      },
      include: { Submissions: { include: { judges: true } } },
    });

    for (const competition of endedCompetitions) {
      const topSubmissions = await this.getTopThreeSubmissions(
        competition.Submissions,
      );

      // Menyimpan pemenang ke dalam database
      for (let i = 0; i < topSubmissions.length; i++) {
        await this.prisma.winners.create({
          data: {
            competition_id: competition.id,
            submission_id: topSubmissions[i].id,
            rank: i + 1, // Rank 1, 2, dan 3
          },
        });
      }
    }
  }

  async getTopThreeSubmissions(submissions) {
    const scoredSubmissions = await Promise.all(
      submissions.map(async (submission) => {
        const finalScore = await this.calculateFinalScore(submission.id);
        return { ...submission, finalScore };
      }),
    );

    // Mengurutkan submission berdasarkan skor tertinggi dan memilih 3 terbaik
    return scoredSubmissions
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, 3);
  }

  async calculateFinalScore(uuid: string): Promise<number> {
    const submission = await this.prisma.submissions.findUniqueOrThrow({
      where: { uuid },
      include: {
        content: {
          select: {
            uuid: true,
          },
        },
        judges: true,
      },
    });

    const averageUserRating = await this.prisma.ratings.aggregate({
      where: { content: { uuid: submission.content.uuid } },
      _avg: {
        rating_value: true,
      },
    });

    const judgeScores = submission.judges.map((judge) => judge.score);
    const averageJudgeScore = judgeScores.length
      ? judgeScores.reduce((a, b) => a + b, 0) / judgeScores.length
      : 0;

    // Jika rata-rata rating user `null`, maka dianggap 0
    const userRatingScore = averageUserRating._avg.rating_value ?? 0;

    // Menghitung skor akhir dengan bobot 40% rating user dan 60% skor juri
    return 0.4 * userRatingScore + 0.6 * averageJudgeScore;
  }

  async getWinnersForCompetition(uuid: string) {
    const competition = await this.prisma.competitions.findUniqueOrThrow({
      where: { uuid },
    });
    return this.prisma.winners.findMany({
      where: { competition_id: competition.id },
      include: { submission: true },
      orderBy: { rank: 'asc' },
    });
  }

  async removeCompetition(competitionUuid: string) {
    await this.prisma.competitions.findUniqueOrThrow({
      where: { uuid: competitionUuid },
    });

    await this.prisma.competitions.delete({
      where: { uuid: competitionUuid },
    });

    return {
      status: 'success',
      message: 'Competition deleted successfully!',
    };
  }
}
