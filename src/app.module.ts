import { Module } from '@nestjs/common';

import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { ContentsModule } from './modules/contents/contents.module';
import { EbooksModule } from './modules/ebooks/ebooks.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { NovelsModule } from './modules/novels/novels.module';
import { AudioPodcastsModule } from './modules/audio-podcasts/audio-podcasts.module';
import { VideoPodcastsModule } from './modules/video-podcasts/video-podcasts.module';
import { BlogsModule } from './modules/blogs/blogs.module';
import { PklReportsModule } from './modules/pkl-reports/pkl-reports.module';
import { StudentsModule } from './modules/students/students.module';
import { MajorsModule } from './modules/majors/majors.module';

@Module({
  imports: [
    ContentsModule,
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
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
