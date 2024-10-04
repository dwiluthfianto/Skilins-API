import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SupabaseService } from 'src/supabase';
import { UuidHelper } from 'src/common/helpers/uuid.helper';

@Module({
  controllers: [TagsController],
  providers: [TagsService, SupabaseService, UuidHelper],
  imports: [PrismaModule],
})
export class TagsModule {}
