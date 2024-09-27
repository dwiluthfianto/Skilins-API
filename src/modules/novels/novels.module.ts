import { Module } from '@nestjs/common';
import { NovelsService } from './novels.service';
import { NovelsController } from './novels.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [NovelsController],
  providers: [NovelsService],
  imports: [PrismaModule],
})
export class NovelsModule {}
