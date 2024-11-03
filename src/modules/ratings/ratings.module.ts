import { Module } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { RatingsController } from './ratings.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [RatingsController],
  providers: [RatingsService],
  imports: [PrismaModule],
})
export class RatingsModule {}
