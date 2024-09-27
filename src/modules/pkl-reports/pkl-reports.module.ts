import { Module } from '@nestjs/common';
import { PklReportsService } from './pkl-reports.service';
import { PklReportsController } from './pkl-reports.controller';

@Module({
  controllers: [PklReportsController],
  providers: [PklReportsService],
})
export class PklReportsModule {}
