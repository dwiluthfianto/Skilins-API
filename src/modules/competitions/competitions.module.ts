import { Module } from '@nestjs/common';
import { CompetitionsService } from './competitions.service';
import { CompetitionsController } from './competitions.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SlugHelper } from 'src/common/helpers/generate-unique-slug';
import { SupabaseService } from 'src/supabase';

@Module({
  controllers: [CompetitionsController],
  providers: [CompetitionsService, SlugHelper, SupabaseService],
  imports: [PrismaModule],
})
export class CompetitionsModule {}
