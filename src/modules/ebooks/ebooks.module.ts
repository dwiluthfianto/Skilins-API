import { Module } from '@nestjs/common';
import { EbooksService } from './ebooks.service';
import { EbooksController } from './ebooks.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SupabaseService } from 'src/supabase';
import { UuidHelper } from 'src/common/helpers/uuid.helper';

@Module({
  controllers: [EbooksController],
  providers: [EbooksService, SupabaseService, UuidHelper],
  imports: [PrismaModule],
})
export class EbooksModule {}
