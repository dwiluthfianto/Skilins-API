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
    // Import ConfigModule to use ConfigService
    ConfigModule.forRoot({
      isGlobal: true, // Ensure ConfigModule is available globally
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule], // Ensure ConfigModule is imported here too
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Fetch JWT secret from config
        signOptions: { expiresIn: '60m' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, SupabaseService, PrismaService],
  exports: [AuthService],
})
export class AuthModule {}
