import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PklReportsService } from './pkl-reports.service';
import { CreatePklReportDto } from './dto/create-pkl-report.dto';
import { UpdatePklReportDto } from './dto/update-pkl-report.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PklReport } from './entities/pkl-report.entity';

@ApiTags('Contents')
@Controller({ path: 'api/contents/reports', version: '1' })
export class PklReportsController {
  constructor(private readonly pklReportsService: PklReportsService) {}

  @Post()
  @ApiCreatedResponse({
    type: PklReport,
  })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPklReportDto: CreatePklReportDto) {
    return this.pklReportsService.create(createPklReportDto);
  }

  @Get()
  @ApiOkResponse({
    type: PklReport,
    isArray: true,
  })
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.pklReportsService.findAll();
  }

  @Get(':uuid')
  @ApiOkResponse({
    type: PklReport,
  })
  @HttpCode(HttpStatus.OK)
  findOne(@Param('uuid') uuid: string) {
    return this.pklReportsService.findOne(uuid);
  }

  @Patch(':uuid')
  @ApiOkResponse({
    type: PklReport,
  })
  @HttpCode(HttpStatus.OK)
  update(
    @Param('uuid') uuid: string,
    @Body() updatePklReportDto: UpdatePklReportDto,
  ) {
    return this.pklReportsService.update(uuid, updatePklReportDto);
  }

  @Delete(':uuid')
  @ApiOkResponse({
    type: PklReport,
  })
  @HttpCode(HttpStatus.OK)
  remove(@Param('uuid') uuid: string) {
    return this.pklReportsService.remove(uuid);
  }
}
