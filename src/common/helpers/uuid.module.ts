import { Module } from '@nestjs/common';
import { UuidHelper } from './uuid.helper';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [UuidHelper],
  exports: [UuidHelper],
  imports: [PrismaModule],
})
export class UuidModule {}
