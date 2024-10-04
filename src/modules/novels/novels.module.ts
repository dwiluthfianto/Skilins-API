import { Module } from '@nestjs/common';
import { NovelsService } from './novels.service';
import { NovelsController } from './novels.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UuidHelper } from 'src/common/helpers/uuid.helper';
import { SupabaseService } from 'src/supabase';

@Module({
  controllers: [NovelsController],
  providers: [NovelsService, UuidHelper, SupabaseService],
  imports: [PrismaModule],
})
export class NovelsModule {}
