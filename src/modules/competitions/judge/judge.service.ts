import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RegisterJudgeDto } from '../dto/register-judge.dto';
import * as bcrypt from 'bcrypt';
import { RoleType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { EvaluateSubmissionDto } from '../dto/evaluate-submission.dto';
import { UpdateJudgeDto } from '../dto/update-judge.dto';

@Injectable()
export class JudgeService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllJudges(page?: number, limit?: number, search: string = '') {
    const judges = await this.prisma.users.findMany({
      where: {
        roles: { name: RoleType.Judge },
        full_name: {
          contains: search,
          mode: 'insensitive',
        },
      },
      select: {
        uuid: true,
        profile_url: true,
        full_name: true,
        email: true,
        Judges: {
          select: {
            role: true,
            linkedin: true,
            instagram: true,
            competition: {
              select: {
                title: true,
              },
            },
          },
        },
      },
      ...(page && limit ? { skip: (page - 1) * limit, take: limit } : {}),
    });

    const total = await this.prisma.users.count({
      where: {
        roles: { name: RoleType.Judge },
        full_name: {
          contains: search,
          mode: 'insensitive',
        },
      },
    });

    return {
      status: 'success',
      data: judges.map((judge) => {
        const judgeData = judge.Judges?.[0];
        return {
          uuid: judge.uuid,
          profile: judge.profile_url,
          full_name: judge.full_name,
          email: judge.email,
          role: judgeData.role,
          linkedin: judgeData.linkedin,
          instagram: judgeData.instagram,
          competition: judgeData.competition?.title,
        };
      }),
      totalPages: limit ? Math.ceil(total / limit) : 1,
      page: page || 1,
      lastPage: limit ? Math.ceil(total / limit) : 1,
    };
  }

  async regisNewJudge(registerJudgeDto: RegisterJudgeDto) {
    const hashedPassword = await bcrypt.hash(registerJudgeDto.password, 10);

    const newUser = await this.prisma.users.create({
      data: {
        email: registerJudgeDto.email,
        password: hashedPassword,
        emailVerified: true,
        full_name: registerJudgeDto.full_name,
        roles: { connect: { name: RoleType.Judge } },
      },
    });

    const newJudge = await this.prisma.judges.create({
      data: {
        role: registerJudgeDto.role,
        linkedin: registerJudgeDto.linkedin,
        instagram: registerJudgeDto.instagram,
        user: { connect: { id: newUser.id } },
      },
    });

    return {
      status: 'success',
      message: 'Judge added successfully!',
      data: {
        uuid: newJudge.uuid,
      },
    };
  }

  async updateInfoJudge(judgeUuid: string, updateJudgeDto: UpdateJudgeDto) {
    const userJudge = await this.prisma.users.findUniqueOrThrow({
      where: { uuid: judgeUuid },
      select: {
        Judges: {
          select: {
            uuid: true,
          },
        },
      },
    });

    const judge = await this.prisma.users.update({
      where: {
        uuid: judgeUuid,
      },
      data: {
        full_name: updateJudgeDto.full_name,
        Judges: {
          update: {
            where: {
              uuid: userJudge.Judges[0].uuid,
            },
            data: {
              role: updateJudgeDto.role,
              linkedin: updateJudgeDto.linkedin,
              instagram: updateJudgeDto.instagram,
            },
          },
        },
      },
    });

    return {
      status: 'success',
      message: 'Judge updated successfully!',
      data: {
        uuid: judge.uuid,
      },
    };
  }

  async removeJudge(judgeUuid: string) {
    const userJudge = await this.prisma.users.findUniqueOrThrow({
      where: { uuid: judgeUuid },
      select: {
        Judges: {
          select: {
            uuid: true,
          },
        },
      },
    });

    await this.prisma.users.update({
      where: { uuid: judgeUuid },
      data: {
        roles: { connect: { name: RoleType.User } },
      },
    });

    await this.prisma.judges.delete({
      where: { uuid: userJudge.Judges[0].uuid },
    });

    return {
      status: 'success',
      message: 'Judge deleted successfully',
    };
  }

  async findAllEvaluationParameter(competitionUuid: string) {
    const parameters = await this.prisma.evaluationParameter.findMany({
      where: { competition: { uuid: competitionUuid } },
    });

    if (!parameters.length) {
      throw new NotFoundException(
        'No evaluation parameters found for this competition.',
      );
    }

    return {
      status: 'success',
      data: parameters,
    };
  }

  async evaluateSubmission(
    judgeUuid: string,
    evaluateSubmissionDto: EvaluateSubmissionDto,
  ) {
    const { submission_uuid, parameter_scores } = evaluateSubmissionDto;

    // Cari submission dan validasi kompetisi
    const submission = await this.prisma.submissions.findUniqueOrThrow({
      where: { uuid: submission_uuid },
      include: { competition: { include: { EvaluationParameter: true } } },
    });

    // Validasi bahwa juri adalah bagian dari kompetisi
    const judge = await this.prisma.judges.findFirstOrThrow({
      where: {
        user: { uuid: judgeUuid },
        competition_id: submission.competition_id,
      },
    });

    // Validasi parameter evaluasi
    const validParameters = submission.competition.EvaluationParameter.map(
      (p) => p.uuid,
    );
    for (const param of parameter_scores) {
      if (!validParameters.includes(param.parameter_uuid)) {
        throw new BadRequestException(
          `Invalid parameter UUID: ${param.parameter_uuid}`,
        );
      }
    }

    // Simpan setiap skor parameter ke database
    const scores = await Promise.all(
      parameter_scores.map(async (param) => {
        const evaluationParameter =
          await this.prisma.evaluationParameter.findUniqueOrThrow({
            where: { uuid: param.parameter_uuid },
          });

        return this.prisma.score.create({
          data: {
            judge_id: judge.id,
            submission_id: submission.id,
            parameter_id: evaluationParameter.id,
            score: param.score,
            notes: param.notes || null,
          },
        });
      }),
    );

    return {
      status: 'success',
      message: 'Submission evaluated successfully',
      data: scores,
    };
  }

  async getScoredSubmission(competitionUuid: string) {
    const scored = await this.prisma.submissions.findMany({
      where: {
        competition: { uuid: competitionUuid },
        content: {
          status: 'APPROVED',
        },
        Score: {
          some: {
            score: {
              not: 0,
            },
          },
        },
      },
      include: {
        student: true,
        content: true,
        competition: true,
      },
    });

    const summary = await this.summaryJudges(competitionUuid);

    return {
      status: 'success',
      data: scored,
      summary,
    };
  }

  async getUnscoredSubmission(competitionUuid: string) {
    const unscored = await this.prisma.submissions.findMany({
      where: {
        competition: { uuid: competitionUuid },
        content: {
          status: 'APPROVED',
        },
        Score: {
          none: {
            score: {
              not: 0,
            },
          },
        },
      },
      include: {
        student: true,
        content: true,
        competition: true,
      },
    });

    const summary = await this.summaryJudges(competitionUuid);

    return {
      status: 'success',
      data: unscored,
      summary,
    };
  }

  async summaryJudges(competitionUuid: string) {
    const scoredSubmissions = await this.prisma.submissions.count({
      where: {
        competition: { uuid: competitionUuid },
        content: {
          status: 'APPROVED',
        },
        Score: {
          some: {
            score: {
              not: { equals: 0 },
            },
          },
        },
      },
    });

    const unscoredSubmissions = await this.prisma.submissions.count({
      where: {
        competition: { uuid: competitionUuid },
        content: {
          status: 'APPROVED',
        },
        Score: {
          none: {
            score: {
              not: { equals: 0 },
            },
          },
        },
      },
    });

    const totalSubmissions = await this.prisma.submissions.count({
      where: {
        competition: { uuid: competitionUuid },
        content: {
          status: 'APPROVED',
        },
      },
    });

    const deadlineJudge = await this.prisma.competitions.findUnique({
      where: {
        uuid: competitionUuid,
      },
      select: {
        end_date: true,
      },
    });

    return {
      scoredSubmissions,
      unscoredSubmissions,
      totalSubmissions,
      deadlineJudge,
    };
  }

  async getJudge(userUuid) {
    const judge = await this.prisma.users.findUnique({
      where: {
        uuid: userUuid,
      },
      include: {
        Judges: {
          include: {
            competition: {
              select: {
                uuid: true,
              },
            },
          },
        },
      },
    });

    return {
      status: 'success',
      data: judge,
    };
  }
}
