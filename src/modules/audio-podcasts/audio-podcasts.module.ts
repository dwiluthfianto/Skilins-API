import { Module } from '@nestjs/common';
import { AudioPodcastsService } from './audio-podcasts.service';
import { AudioPodcastsController } from './audio-podcasts.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UuidModule } from 'src/common/helpers/uuid.module';

@Module({
  controllers: [AudioPodcastsController],
  providers: [AudioPodcastsService],
  imports: [PrismaModule, UuidModule],
})
export class AudioPodcastsModule {}
