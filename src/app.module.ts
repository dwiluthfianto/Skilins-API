import { Module } from '@nestjs/common';

import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { EbooksModule } from './modules/ebooks/ebooks.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { AudioPodcastsModule } from './modules/audio-podcasts/audio-podcasts.module';
import { VideoPodcastsModule } from './modules/video-podcasts/video-podcasts.module';
import { BlogsModule } from './modules/blogs/blogs.module';
import { StudentsModule } from './modules/students/students.module';
import { MajorsModule } from './modules/majors/majors.module';
import { CommentsModule } from './modules/comments/comments.module';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { MailerConfigModule } from './modules/mailer/mailer.module';
import { HealthModule } from './modules/health/health.module';
import { GenresModule } from './modules/genres/genres.module';
import { RatingsModule } from './modules/ratings/ratings.module';
import { ContentsModule } from './modules/contents/contents.module';
import { CompetitionsModule } from './modules/competitions/competitions.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TagsModule } from './modules/tags/tags.module';

@Module({
  imports: [
    PrismaModule,
    EbooksModule,
    CategoriesModule,
    AudioPodcastsModule,
    VideoPodcastsModule,
    BlogsModule,
    StudentsModule,
    MajorsModule,
    CommentsModule,
    SupabaseModule,
    AuthModule,
    UsersModule,
    ConfigModule.forRoot(),
    PassportModule,
    SupabaseModule,
    AnalyticsModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    ScheduleModule.forRoot(),
    MailerConfigModule,
    HealthModule,
    GenresModule,
    RatingsModule,
    ContentsModule,
    CompetitionsModule,
    TagsModule,
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
