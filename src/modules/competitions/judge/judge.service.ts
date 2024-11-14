import { Injectable } from '@nestjs/common';
import { RegisterJudgeDto } from '../dto/register-judge.dto';
import * as bcrypt from 'bcrypt';
import { RoleType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { EvaluateSubmissionDto } from '../dto/evaluate-submission.dto';

@Injectable()
export class JudgeService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllJudges(page: number, limit: number, search: string) {
    const judges = await this.prisma.users.findMany({
      skip: (page - 1) * limit,
      take: limit,
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
      totalPages: Math.ceil(total / limit),
      page,
      lastPage: Math.ceil(total / limit),
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

  async evaluateSubmission(
    judgeUuid: string,
    evaluateSubmissionDto: EvaluateSubmissionDto,
  ) {
    // Cari submission yang diminta oleh juri
    const submission = await this.prisma.submissions.findUnique({
      where: { uuid: evaluateSubmissionDto.submission_uuid },
      include: { competition: true },
    });

    const judge = await this.prisma.judges.findFirstOrThrow({
      where: {
        user: { uuid: judgeUuid },
        competition_id: submission.competition_id,
      },
    });

    if (judge.score !== null) {
      throw new Error('You have already rated this submission.');
    }

    await this.prisma.judges.update({
      where: { id: judge.id },
      data: {
        score: evaluateSubmissionDto.score,
        comment: evaluateSubmissionDto.comment,
      },
    });
  }
}
