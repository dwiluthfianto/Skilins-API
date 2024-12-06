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
        winner_count: data.winner_count,
        submission_deadline: data.submission_deadline,
      },
    });

    const parameters = parseArrayInput(data.parameters);

    if (parameters && parameters.length > 0) {
      console.log(parameters);

      const evaluationParameters = parameters.map((param) => ({
        competition_id: competition.id,
        parameterName: param.parameterName,
        weight: parseInt(param.weight, 10),
      }));

      await this.prisma.evaluationParameter.createMany({
        data: evaluationParameters,
      });
    }

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
        winner_count: data.winner_count,
        submission_deadline: data.submission_deadline,
      },
    });

    if (data.parameters && data.parameters.length > 0) {
      const evaluationParameters = data.parameters.map((param) => ({
        competition_id: competition.id,
        parameterName: param.parameterName,
        weight: param.weight,
      }));

      await this.prisma.evaluationParameter.updateMany({
        data: evaluationParameters,
      });
    }

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
                    slug: true,
                    thumbnail: true,
                  },
                },
                student: {
                  select: {
                    name: true,
                    major: true,
                  },
                },
                Score: true,
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

    const endedCompetitions = await this.prisma.competitions.findMany({
      where: {
        end_date: { lte: today },
        Winners: { none: {} },
      },
      include: { Submissions: { include: { judges: true } } },
    });

    for (const competition of endedCompetitions) {
      const winnerCount = competition.winner_count;

      const topSubmissions = await this.getTopSubmissions(
        competition.Submissions,
        winnerCount,
      );

      for (let i = 0; i < topSubmissions.length; i++) {
        await this.prisma.winners.create({
          data: {
            competition_id: competition.id,
            submission_id: topSubmissions[i].id,
            rank: i + 1,
          },
        });
      }
    }
  }

  async getTopSubmissions(submissions, winnerCount: number) {
    const scoredSubmissions = await Promise.all(
      submissions.map(async (submission) => {
        const finalScore = await this.calculateFinalScore(submission.uuid);
        return { ...submission, finalScore };
      }),
    );

    return scoredSubmissions
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, winnerCount);
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
        Score: {
          select: {
            parameter: {
              select: {
                parameterName: true,
                weight: true,
                scores: {
                  select: {
                    score: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    let totalWeightedScore = 0;
    let totalWeight = 0;

    submission.Score.forEach((index) => {
      const scores = index.parameter.scores.map((s) => s.score);
      const averageParameterScore = scores.length
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : 0;

      totalWeightedScore +=
        averageParameterScore * (index.parameter.weight / 100);
      totalWeight += index.parameter.weight;
    });

    const normalizedScore =
      totalWeight > 0 ? totalWeightedScore / (totalWeight / 100) : 0;

    const averageUserRating = await this.prisma.ratings.aggregate({
      where: { content: { uuid: submission.content.uuid } },
      _avg: {
        rating_value: true,
      },
    });

    const userRatingScore = averageUserRating._avg.rating_value ?? 0;

    const finalScore = 0.2 * userRatingScore + 0.8 * normalizedScore;

    return finalScore;
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
