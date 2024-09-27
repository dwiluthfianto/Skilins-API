import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PklReportsService } from './pkl-reports.service';
import { CreatePklReportDto } from './dto/create-pkl-report.dto';
import { UpdatePklReportDto } from './dto/update-pkl-report.dto';

@Controller('pkl-reports')
export class PklReportsController {
  constructor(private readonly pklReportsService: PklReportsService) {}

  @Post()
  create(@Body() createPklReportDto: CreatePklReportDto) {
    return this.pklReportsService.create(createPklReportDto);
  }

  @Get()
  findAll() {
    return this.pklReportsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pklReportsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePklReportDto: UpdatePklReportDto) {
    return this.pklReportsService.update(+id, updatePklReportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pklReportsService.remove(+id);
  }
}
