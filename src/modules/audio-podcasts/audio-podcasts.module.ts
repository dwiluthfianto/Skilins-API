import { Module } from '@nestjs/common';
import { AudioPodcastsService } from './audio-podcasts.service';
import { AudioPodcastsController } from './audio-podcasts.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UuidModule } from 'src/common/helpers/uuid.module';
import { SupabaseService } from 'src/supabase';

@Module({
  controllers: [AudioPodcastsController],
  providers: [AudioPodcastsService, SupabaseService],
  imports: [PrismaModule, UuidModule],
})
export class AudioPodcastsModule {}
