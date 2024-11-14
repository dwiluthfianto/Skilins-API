import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateSubmissionDto } from '../dto/create-submission.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ContentStatus, ContentType } from '@prisma/client';
import { ContentsService } from 'src/modules/contents/contents.service';
import { MailerService } from '@nestjs-modules/mailer';
import { AudioPodcastsService } from 'src/modules/audio-podcasts/audio-podcasts.service';
import { VideoPodcastsService } from 'src/modules/video-podcasts/video-podcasts.service';
import { PrakerinService } from 'src/modules/prakerin/prakerin.service';

@Injectable()
export class SubmissionService {
  private readonly logger = new Logger(SubmissionService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly contentService: ContentsService,
    private readonly mailerService: MailerService,
    private readonly audioPodcastService: AudioPodcastsService,
    private readonly videoPodcastService: VideoPodcastsService,
    private readonly prakerinService: PrakerinService,
  ) {}
  async submitToCompetition(
    userUuid: string,
    createSubmissionDto: CreateSubmissionDto,
  ) {
    const { competition_slug, type, audioData, videoData, prakerinData } =
      createSubmissionDto;

    const competition = await this.prisma.competitions.findUniqueOrThrow({
      where: { slug: competition_slug },
    });

    if (new Date() > competition.submission_deadline) {
      throw new BadRequestException('Submission deadline has passed.');
    }

    let content;

    if (type === ContentType.AUDIO && audioData) {
      content = await this.audioPodcastService.create(audioData);
    }
    if (type === ContentType.VIDEO && videoData) {
      content = await this.videoPodcastService.create(videoData);
    }
    if (type === ContentType.PRAKERIN && prakerinData) {
      content = await this.prakerinService.create(prakerinData);
    }

    if (!content || competition.type !== content.type) {
      throw new BadRequestException(
        'Content category does not match competition category.',
      );
    }
    const userData = await this.prisma.users.findUniqueOrThrow({
      where: {
        uuid: userUuid,
      },
      include: {
        Students: {
          select: {
            uuid: true,
          },
        },
      },
    });

    const submit = await this.prisma.submissions.create({
      data: {
        student: { connect: { uuid: userData.Students[0].uuid } },
        content: { connect: { uuid: content.data.uuid } },
        competition: { connect: { slug: competition_slug } },
      },
    });

    return {
      status: 'success',
      message: 'Successfully join the competition.',
      data: submit,
    };
  }

  async approveSubmission(submissionUuid: string) {
    const submission = await this.prisma.submissions.findUniqueOrThrow({
      where: { uuid: submissionUuid },
      include: {
        content: true,
        competition: true,
        student: { include: { user: { select: { email: true } } } },
      },
    });

    await this.mailerService.sendMail({
      to: submission.student.user.email,
      subject: 'Submission Approved',
      template: './submission-approved',
      context: {
        name: submission.student.name,
        competition_name: submission.competition.title,
        title_submission: submission.content.title,
        submission_id: submission.id,
        submission_date: submission.created_at,
        judging_dates: `${submission.competition.start_date} - ${submission.competition.end_date}`,
        announcement_date: submission.competition.end_date,
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

  async rejectSubmission(submissionUuid: string) {
    const submission = await this.prisma.submissions.findUniqueOrThrow({
      where: { uuid: submissionUuid },
      include: {
        competition: true,
        content: true,
        student: { include: { user: { select: { email: true } } } },
      },
    });

    await this.mailerService.sendMail({
      to: submission.student.user.email,
      subject: `Submission Rejected`,
      template: './submission-rejected',
      context: {
        name: submission.student.name,
        competition_name: submission.competition.title,
        title_submission: submission.content.title,
        submission_id: submission.id,
        submission_date: submission.created_at,
      },
    });

    this.logger.log(`Approved Submission sent to ${submission.student.name}`);
    return this.contentService.updateContentStatus(
      submission.content.uuid,
      ContentStatus.REJECTED,
    );
  }
}
