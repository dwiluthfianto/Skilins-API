import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { UpdateCompetitionDto } from './dto/update-competition.dto';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { JudgeSubmissionDto } from './dto/judge-submission.dto';
import { SlugHelper } from 'src/common/helpers/generate-unique-slug';
import { ContentsService } from '../contents/contents.service';
import { ContentStatus, ContentType } from '@prisma/client';
import { MailerService } from '@nestjs-modules/mailer';
import { RejectSubmissionDto } from './dto/reject-submission.dto';
import { AudioPodcastsService } from '../audio-podcasts/audio-podcasts.service';
import { VideoPodcastsService } from '../video-podcasts/video-podcasts.service';
import { PrakerinService } from '../prakerin/prakerin.service';

@Injectable()
export class CompetitionsService {
  private readonly logger = new Logger(CompetitionsService.name);
  constructor(
    private prisma: PrismaService,
    private readonly slugHelper: SlugHelper,
    private readonly contentService: ContentsService,
    private readonly mailerService: MailerService,
    private readonly audioPodcastService: AudioPodcastsService,
    private readonly videoPodcastService: VideoPodcastsService,
    private readonly prakerinService: PrakerinService,
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

  async submitToCompetition(
    studentUuid: string,
    createSubmissionDto: CreateSubmissionDto,
  ) {
    const { competition_uuid, type, audioData, videoData, prakerinData } =
      createSubmissionDto;

    const competition = await this.prisma.competitions.findUniqueOrThrow({
      where: { uuid: competition_uuid },
    });

    if (new Date() > competition.submission_deadline) {
      throw new BadRequestException('Submission deadline has passed.');
    }

    let content;

    if (type === ContentType.AudioPodcast && audioData) {
      content = await this.audioPodcastService.create(audioData);
    }
    if (type === ContentType.VideoPodcast && videoData) {
      content = await this.videoPodcastService.create(videoData);
    }
    if (type === ContentType.Prakerin && prakerinData) {
      content = await this.prakerinService.create(prakerinData);
    }

    if (!content || competition.type !== content.type) {
      throw new BadRequestException(
        'Content category does not match competition category.',
      );
    }

    return await this.prisma.submissions.create({
      data: {
        student: { connect: { uuid: studentUuid } },
        content: { connect: { uuid: content.data.uuid } },
        competition: { connect: { uuid: competition_uuid } },
      },
    });
  }

  async approveSubmission(submissionUuid: string) {
    const submission = await this.prisma.submissions.findUniqueOrThrow({
      where: { uuid: submissionUuid },
      include: { content: true, student: true },
    });

    await this.mailerService.sendMail({
      to: submission.student.name,
      subject: 'Submission Approved',
      template: './submission-approved',
      context: {
        name: submission.student.name,
      },
    });

    this.logger.log(
      `Approved Submission email sent to ${submission.student.name}`,
    );
    return this.contentService.updateContentStatus(
      submission.content.uuid,
      ContentStatus.APPROVED,
    );
  }

  async rejectSubmission(
    submissionUuid: string,
    rejectSubmissionDto: RejectSubmissionDto,
  ) {
    const submission = await this.prisma.submissions.findUniqueOrThrow({
      where: { uuid: submissionUuid },
      include: { content: true, student: true },
    });

    await this.mailerService.sendMail({
      to: submission.student.name,
      subject: `Submission Rejected`,
      template: './submission-rejected',
      context: {
        name: submission.student.name,
        reason: rejectSubmissionDto.reason,
      },
    });

    this.logger.log(`Approved Submission sent to ${submission.student.name}`);
    return this.contentService.updateContentStatus(
      submission.content.uuid,
      ContentStatus.REJECTED,
    );
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
