import { Module } from '@nestjs/common';
import { NovelsService } from './novels.service';
import { NovelsController } from './novels.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UuidModule } from 'src/common/helpers/uuid.module';

@Module({
  controllers: [NovelsController],
  providers: [NovelsService],
  imports: [PrismaModule, UuidModule],
})
export class NovelsModule {}
