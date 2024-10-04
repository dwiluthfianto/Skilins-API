import { Module } from '@nestjs/common';
import { MajorsService } from './majors.service';
import { MajorsController } from './majors.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SupabaseService } from 'src/supabase';
import { UuidHelper } from 'src/common/helpers/uuid.helper';

@Module({
  controllers: [MajorsController],
  providers: [MajorsService, SupabaseService, UuidHelper],
  imports: [PrismaModule],
})
export class MajorsModule {}
