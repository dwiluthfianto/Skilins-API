import { Module } from '@nestjs/common';
import { PklReportsService } from './pkl-reports.service';
import { PklReportsController } from './pkl-reports.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UuidModule } from 'src/common/helpers/uuid.module';

@Module({
  controllers: [PklReportsController],
  providers: [PklReportsService],
  imports: [PrismaModule, UuidModule],
})
export class PklReportsModule {}
