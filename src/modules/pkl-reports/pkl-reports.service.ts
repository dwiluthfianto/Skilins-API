import { Injectable } from '@nestjs/common';
import { CreatePklReportDto } from './dto/create-pkl-report.dto';
import { UpdatePklReportDto } from './dto/update-pkl-report.dto';

@Injectable()
export class PklReportsService {
  create(createPklReportDto: CreatePklReportDto) {
    return 'This action adds a new pklReport';
  }

  findAll() {
    return `This action returns all pklReports`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pklReport`;
  }

  update(id: number, updatePklReportDto: UpdatePklReportDto) {
    return `This action updates a #${id} pklReport`;
  }

  remove(id: number) {
    return `This action removes a #${id} pklReport`;
  }
}
