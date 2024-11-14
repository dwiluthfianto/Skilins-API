import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { UpdateCompetitionDto } from './dto/update-competition.dto';

import { SlugHelper } from 'src/common/helpers/generate-unique-slug';

@Injectable()
export class CompetitionsService {
  private readonly logger = new Logger(CompetitionsService.name);
  constructor(
    private prisma: PrismaService,
    private readonly slugHelper: SlugHelper,
  ) {}

  async createCompetition(data: CreateCompetitionDto) {
    const newSlug = await this.slugHelper.generateUniqueSlug(data.title);
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

    if (data.judge_uuids && data.judge_uuids.length > 0) {
      await this.prisma.$transaction(
        data.judge_uuids.map((judge_uuid) =>
          this.prisma.judges.create({
            data: {
              user: { connect: { uuid: judge_uuid } },
              competition: { connect: { uuid: competition.uuid } },
              score: 0,
              submission: null,
            },
          }),
        ),
      );
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

    if (data.judge_uuids && data.judge_uuids.length > 0) {
      await this.prisma.$transaction(
        data.judge_uuids.map((judge_uuid) =>
          this.prisma.judges.create({
            data: {
              user: { connect: { uuid: judge_uuid } },
              competition: { connect: { uuid: competition.uuid } },
            },
          }),
        ),
      );
    }
    return {
      status: 'success',
      message: 'Competition updated successfully!',
      data: {
        uuid: competition.uuid,
      },
    };
  }

  async getAllCompetitions() {
    const competitions = await this.prisma.competitions.findMany();

    return {
      status: 'success',
      data: competitions.map((competition) => ({
        uuid: competition.uuid,
        thumbnail: competition.thumbnail,
        title: competition.title,
        slug: competition.slug,
        type: competition.type,
        start_date: competition.start_date,
        end_date: competition.end_date,
        submission_date: competition.submission_deadline,
      })),
    };
  }

  async getCompetitionBySlug(slug: string) {
    const competition = await this.prisma.competitions.findUniqueOrThrow({
      where: { slug },
      include: {
        Submissions: {
          include: { judges: true, student: true, content: true },
        },
        Winners: true,
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
          include: { judges: true, student: true, content: true },
        },
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
}
