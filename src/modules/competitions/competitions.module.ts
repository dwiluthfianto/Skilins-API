import { Module } from '@nestjs/common';
import { CompetitionsService } from './competitions.service';
import { CompetitionsController } from './competitions.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SlugHelper } from 'src/common/helpers/generate-unique-slug';
import { SupabaseService } from 'src/supabase';
import { ContentsService } from '../contents/contents.service';
import { ConfigModule } from '@nestjs/config';
import { UuidHelper } from 'src/common/helpers/uuid.helper';
import { AudioPodcastsService } from '../audio-podcasts/audio-podcasts.service';
import { VideoPodcastsService } from '../video-podcasts/video-podcasts.service';
import { PrakerinService } from '../prakerin/prakerin.service';

@Module({
  controllers: [CompetitionsController],
  providers: [
    CompetitionsService,
    SlugHelper,
    SupabaseService,
    ContentsService,
    UuidHelper,
    AudioPodcastsService,
    VideoPodcastsService,
    PrakerinService,
  ],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
  ],
})
export class CompetitionsModule {}
