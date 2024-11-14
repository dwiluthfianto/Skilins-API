import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RegisterJudgeDto } from '../dto/register-judge.dto';
import { JudgeService } from './judge.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/modules/roles/roles.decorator';
import { ApiTags } from '@nestjs/swagger';
import { EvaluateSubmissionDto } from '../dto/evaluate-submission.dto';

@ApiTags('Judge')
@Controller({ path: 'api/v1/judges', version: '1' })
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class JudgeController {
  constructor(private readonly judgeService: JudgeService) {}

  @Get('')
  @Roles('Staff')
  @HttpCode(HttpStatus.OK)
  async findAllJudges(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string = '',
  ) {
    return await this.judgeService.findAllJudges(page, limit, search);
  }

  @Post('add')
  @Roles('Staff')
  async registerJudge(@Body() registerJudgeDto: RegisterJudgeDto) {
    return await this.judgeService.regisNewJudge(registerJudgeDto);
  }

  @Patch(':judgeUuid')
  @Roles('Judge')
  async evaluateSubmission(
    @Param('judgeUuid') judgeUuid: string,
    @Body() evaluateSubmissionDto: EvaluateSubmissionDto,
  ) {
    return await this.judgeService.evaluateSubmission(
      judgeUuid,
      evaluateSubmissionDto,
    );
  }
}
