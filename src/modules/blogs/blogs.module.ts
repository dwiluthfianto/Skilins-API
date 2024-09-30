import { Module } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { BlogsController } from './blogs.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UuidModule } from 'src/common/helpers/uuid.module';

@Module({
  controllers: [BlogsController],
  providers: [BlogsService],
  imports: [PrismaModule, UuidModule],
})
export class BlogsModule {}
