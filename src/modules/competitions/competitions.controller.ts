import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { CompetitionsService } from './competitions.service';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { UpdateCompetitionDto } from './dto/update-competition.dto';
import { CreateSubmissionDto } from './dto/create-submission.dto';

@Controller('competitions')
export class CompetitionsController {
  constructor(private readonly competitionsService: CompetitionsService) {}

  @Post()
  create(@Body() createCompetitionDto: CreateCompetitionDto) {
    return this.competitionsService.createCompetition(createCompetitionDto);
  }

  @Get()
  findAll() {
    return this.competitionsService.getAllCompetitions();
  }

  @Get(':uuid')
  findOne(@Param('uuid') uuid: string) {
    return this.competitionsService.getCompetitionById(uuid);
  }

  @Patch(':uuid')
  update(
    @Param('uuid') uuid: string,
    @Body() updateCompetitionDto: UpdateCompetitionDto,
  ) {
    return this.competitionsService.updateCompetition(
      uuid,
      updateCompetitionDto,
    );
  }

  @Post('submit')
  submitToCompetition(@Body() createSubmissionDto: CreateSubmissionDto) {
    return this.competitionsService.submitToCompetition(createSubmissionDto);
  }

  @Get(':uuid/winners')
  async getCompetitionWinners(@Param('uuid') uuid: string) {
    return this.competitionsService.getWinnersForCompetition(uuid);
  }
}
