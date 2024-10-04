import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module'; // Import UsersModule
import { PrismaService } from 'src/prisma/prisma.service';
import { SupabaseService } from 'src/supabase';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UsersModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, SupabaseService, PrismaService],
  exports: [AuthService],
})
export class AuthModule {}
