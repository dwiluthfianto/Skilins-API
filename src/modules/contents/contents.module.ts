import { Module } from '@nestjs/common';
import { ContentsService } from './contents.service';
import { ContentsController } from './contents.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [ContentsController],
  providers: [ContentsService],
  imports: [PrismaModule],
})
export class ContentsModule {}
