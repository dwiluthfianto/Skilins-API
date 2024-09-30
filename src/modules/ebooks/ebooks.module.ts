import { Module } from '@nestjs/common';
import { EbooksService } from './ebooks.service';
import { EbooksController } from './ebooks.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UuidModule } from 'src/common/helpers/uuid.module';

@Module({
  controllers: [EbooksController],
  providers: [EbooksService],
  imports: [PrismaModule, UuidModule],
})
export class EbooksModule {}
