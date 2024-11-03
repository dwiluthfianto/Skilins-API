import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SupabaseService } from 'src/supabase';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService, SupabaseService],
  exports: [UsersService], // Export UsersService to be used in AuthModule and other modules
})
export class UsersModule {}
