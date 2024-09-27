import { Module } from '@nestjs/common';
import { AudioPodcastsService } from './audio-podcasts.service';
import { AudioPodcastsController } from './audio-podcasts.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [AudioPodcastsController],
  providers: [AudioPodcastsService],
  imports: [PrismaModule],
})
export class AudioPodcastsModule {}
