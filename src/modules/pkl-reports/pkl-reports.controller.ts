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
  UseGuards,
} from '@nestjs/common';
import { PklReportsService } from './pkl-reports.service';
import { CreatePklReportDto } from './dto/create-pkl-report.dto';
import { UpdatePklReportDto } from './dto/update-pkl-report.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PklReport } from './entities/pkl-report.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from '../roles/roles.decorator';

@ApiTags('Contents')
@Controller({ path: 'api/contents/reports', version: '1' })
export class PklReportsController {
  constructor(private readonly pklReportsService: PklReportsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
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
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
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
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiOkResponse({
    type: PklReport,
  })
  @HttpCode(HttpStatus.OK)
  remove(@Param('uuid') uuid: string) {
    return this.pklReportsService.remove(uuid);
  }
}
