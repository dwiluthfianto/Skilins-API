import { Module } from '@nestjs/common';
import { ContentsController } from './contents.controller';
import { ContentsService } from './contents.service';
import { UuidHelper } from 'src/common/helpers/uuid.helper';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [ContentsController],
  providers: [ContentsService, UuidHelper],
  imports: [PrismaModule],
})
export class ContentsModule {}
