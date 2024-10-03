import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [StudentsController],
  providers: [StudentsService, JwtService],
  imports: [PrismaModule, AuthModule],
})
export class StudentsModule {}
