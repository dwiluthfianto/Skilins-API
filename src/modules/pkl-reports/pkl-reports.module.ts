import { Module } from '@nestjs/common';
import { PklReportsService } from './pkl-reports.service';
import { PklReportsController } from './pkl-reports.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SupabaseService } from 'src/supabase';
import { UuidHelper } from 'src/common/helpers/uuid.helper';

@Module({
  controllers: [PklReportsController],
  providers: [PklReportsService, SupabaseService, UuidHelper],
  imports: [PrismaModule],
})
export class PklReportsModule {}
