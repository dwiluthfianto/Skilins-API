import { Module } from '@nestjs/common';
import { AudioPodcastsService } from './audio-podcasts.service';
import { AudioPodcastsController } from './audio-podcasts.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SupabaseService } from 'src/supabase';
import { UuidHelper } from 'src/common/helpers/uuid.helper';
import { SlugHelper } from 'src/common/helpers/generate-unique-slug';

@Module({
  controllers: [AudioPodcastsController],
  providers: [AudioPodcastsService, SupabaseService, UuidHelper, SlugHelper],
  imports: [PrismaModule],
})
export class AudioPodcastsModule {}
