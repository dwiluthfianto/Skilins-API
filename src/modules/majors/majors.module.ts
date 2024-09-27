import { Module } from '@nestjs/common';
import { MajorsService } from './majors.service';
import { MajorsController } from './majors.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [MajorsController],
  providers: [MajorsService],
  imports: [PrismaModule],
})
export class MajorsModule {}
