import { Module } from '@nestjs/common';
import { AudioPodcastsService } from './audio-podcasts.service';
import { AudioPodcastsController } from './audio-podcasts.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UuidModule } from 'src/common/helpers/uuid.module';
// import { SupabaseModule } from 'src/supabase/supabase.module';
import { createClient } from '@supabase/supabase-js';
import { SupabaseService } from 'src/supabase/supabase.service';

@Module({
  controllers: [AudioPodcastsController],
  providers: [
    AudioPodcastsService,
    {
      provide: SupabaseService,

      useFactory: () =>
        createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY),
    },
  ],
  imports: [PrismaModule, UuidModule],
})
export class AudioPodcastsModule {}
