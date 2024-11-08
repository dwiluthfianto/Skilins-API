import { BadRequestException, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { UpdateCompetitionDto } from './dto/update-competition.dto';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { JudgeSubmissionDto } from './dto/judge-submission.dto';
import { SlugHelper } from 'src/common/helpers/generate-unique-slug';

@Injectable()
export class CompetitionsService {
  constructor(
    private prisma: PrismaService,
    private readonly slugHelper: SlugHelper,
  ) {}

  async createCompetition(data: CreateCompetitionDto) {
    const newSlug = await this.slugHelper.generateUniqueSlug(data.title);
    const competition = await this.prisma.competitions.create({
      data: {
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

    return {
      status: 'success',
      message: 'Competition Added Successfully!',
      data: {
        uuid: competition.uuid,
      },
    };
  }

  async updateCompetition(uuid: string, data: UpdateCompetitionDto) {
    const competition = await this.prisma.competitions.update({
      where: { uuid },
      data,
    });

    return {
      status: 'success',
      message: 'Competition updated successfully!',
      data: {
        uuid: competition.uuid,
      },
    };
  }

  async getAllCompetitions() {
    return await this.prisma.competitions.findMany({
      include: { submissions: true },
    });
  }

  async getCompetitionById(uuid: string) {
    return await this.prisma.competitions.findUnique({
      where: { uuid },
      include: {
        submissions: {
          include: { judges: true, student: true, content: true },
        },
      },
    });
  }

  async submitToCompetition(createSubmissionDto: CreateSubmissionDto) {
    const { student_uuid, content_uuid, competition_uuid } =
      createSubmissionDto;

    const competition = await this.prisma.competitions.findUniqueOrThrow({
      where: { uuid: competition_uuid },
    });
    const content = await this.prisma.contents.findUniqueOrThrow({
      where: { uuid: content_uuid },
    });

    if (competition.type !== content.type) {
      throw new BadRequestException(
        'Content category does not match competition category.',
      );
    }

    return await this.prisma.submissions.create({
      data: {
        student: { connect: { uuid: student_uuid } },
        content: { connect: { uuid: content_uuid } },
        competition: { connect: { uuid: competition_uuid } },
      },
    });
  }

  async judgeSubmission(judgeSubmissionDto: JudgeSubmissionDto) {
    const { user_uuid, submission_uuid, score, comment } = judgeSubmissionDto;

    if (score < 1 || score > 5) {
      throw new Error('Rating value must be between 1 and 5.');
    }

    const judge = await this.prisma.judges.create({
      data: {
        user: { connect: { uuid: user_uuid } },
        submission: { connect: { uuid: submission_uuid } },
        score,
        comment,
      },
    });

    return {
      status: 'success',
      message: 'Successfully judge submission',
      data: {
        uuid: judge.uuid,
      },
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
      include: { submissions: { include: { judges: true } } },
    });

    for (const competition of endedCompetitions) {
      const topSubmissions = await this.getTopThreeSubmissions(
        competition.submissions,
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

    const average_user_rating = await this.prisma.ratings.aggregate({
      where: { content: { uuid: submission.content.uuid } },
      _avg: {
        rating_value: true,
      },
    });

    const judgeScores = submission.judges.map((judge) => judge.score);
    const averageJudgeScore =
      judgeScores.reduce((a, b) => a + b, 0) / judgeScores.length;

    return (
      0.4 * average_user_rating._avg.rating_value + 0.6 * averageJudgeScore
    );
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
