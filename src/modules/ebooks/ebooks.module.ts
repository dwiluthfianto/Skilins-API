import { Module } from '@nestjs/common';
import { EbooksService } from './ebooks.service';
import { EbooksController } from './ebooks.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [EbooksController],
  providers: [EbooksService],
  imports: [PrismaModule],
})
export class EbooksModule {}
