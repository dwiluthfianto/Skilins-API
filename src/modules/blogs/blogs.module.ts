import { Module } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { BlogsController } from './blogs.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UuidHelper } from 'src/common/helpers/uuid.helper';
import { SupabaseService } from 'src/supabase';

@Module({
  controllers: [BlogsController],
  providers: [BlogsService, UuidHelper, SupabaseService],
  imports: [PrismaModule],
})
export class BlogsModule {}
