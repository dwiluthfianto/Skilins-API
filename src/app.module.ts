import { Module } from '@nestjs/common';

import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { EbooksModule } from './modules/ebooks/ebooks.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { NovelsModule } from './modules/novels/novels.module';
import { AudioPodcastsModule } from './modules/audio-podcasts/audio-podcasts.module';
import { VideoPodcastsModule } from './modules/video-podcasts/video-podcasts.module';
import { BlogsModule } from './modules/blogs/blogs.module';
import { PklReportsModule } from './modules/pkl-reports/pkl-reports.module';
import { StudentsModule } from './modules/students/students.module';
import { MajorsModule } from './modules/majors/majors.module';
import { TagsModule } from './modules/tags/tags.module';
import { LikesModule } from './modules/likes/likes.module';
import { CommentsModule } from './modules/comments/comments.module';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    PrismaModule,
    EbooksModule,
    CategoriesModule,
    NovelsModule,
    AudioPodcastsModule,
    VideoPodcastsModule,
    BlogsModule,
    PklReportsModule,
    StudentsModule,
    MajorsModule,
    TagsModule,
    LikesModule,
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
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
