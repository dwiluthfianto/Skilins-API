import { Module } from '@nestjs/common';
import { GenresService } from './genres.service';
import { GenresController } from './genres.controller';
import { UuidHelper } from 'src/common/helpers/uuid.helper';
import { SupabaseService } from 'src/supabase';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [GenresController],
  providers: [GenresService, SupabaseService, UuidHelper],
  imports: [PrismaModule],
})
export class GenresModule {}
