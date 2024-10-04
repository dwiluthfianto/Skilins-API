import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SupabaseService } from 'src/supabase';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, SupabaseService],
  imports: [PrismaModule],
})
export class CategoriesModule {}
