import { Module } from '@nestjs/common';
import { PrakerinService } from './prakerin.service';
import { PrakerinController } from './prakerin.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SupabaseService } from 'src/supabase';
import { UuidHelper } from 'src/common/helpers/uuid.helper';
import { SlugHelper } from 'src/common/helpers/generate-unique-slug';

@Module({
  controllers: [PrakerinController],
  providers: [PrakerinService, SupabaseService, UuidHelper, SlugHelper],
  imports: [PrismaModule],
})
export class PrakerinModule {}
