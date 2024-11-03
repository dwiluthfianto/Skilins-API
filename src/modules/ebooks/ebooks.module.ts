import { Module } from '@nestjs/common';
import { EbooksService } from './ebooks.service';
import { EbooksController } from './ebooks.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SupabaseService } from 'src/supabase';
import { UuidHelper } from 'src/common/helpers/uuid.helper';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { SlugHelper } from 'src/common/helpers/generate-unique-slug';

@Module({
  controllers: [EbooksController],
  providers: [
    EbooksService,
    SupabaseService,
    UuidHelper,
    SlugHelper,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  imports: [PrismaModule],
})
export class EbooksModule {}
