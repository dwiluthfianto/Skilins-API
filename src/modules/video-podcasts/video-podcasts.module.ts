import { Module } from '@nestjs/common';
import { VideoPodcastsService } from './video-podcasts.service';
import { VideoPodcastsController } from './video-podcasts.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [VideoPodcastsController],
  providers: [VideoPodcastsService],
  imports: [PrismaModule],
})
export class VideoPodcastsModule {}
