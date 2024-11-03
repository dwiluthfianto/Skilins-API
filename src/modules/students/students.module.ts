import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UuidHelper } from 'src/common/helpers/uuid.helper';

@Module({
  controllers: [StudentsController],
  providers: [StudentsService, UuidHelper],
  imports: [PrismaModule],
})
export class StudentsModule {}
