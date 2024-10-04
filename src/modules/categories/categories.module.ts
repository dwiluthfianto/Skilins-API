import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SupabaseService } from 'src/supabase';
import { UuidHelper } from 'src/common/helpers/uuid.helper';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, SupabaseService, UuidHelper],
  imports: [PrismaModule],
})
export class CategoriesModule {}
