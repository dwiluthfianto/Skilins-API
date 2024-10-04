import { Module } from '@nestjs/common';
import { VideoPodcastsService } from './video-podcasts.service';
import { VideoPodcastsController } from './video-podcasts.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UuidHelper } from 'src/common/helpers/uuid.helper';
import { SupabaseService } from 'src/supabase';

@Module({
  controllers: [VideoPodcastsController],
  providers: [VideoPodcastsService, UuidHelper, SupabaseService],
  imports: [PrismaModule],
})
export class VideoPodcastsModule {}
