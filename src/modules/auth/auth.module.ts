import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module'; // Import UsersModule
import { PrismaService } from 'src/prisma/prisma.service';
import { SupabaseService } from 'src/supabase';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from 'src/common/strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get<string>('AUTH_JWT_SECRET'),
          signOptions: {
            expiresIn: configService.get<string>('AUTH_JWT_TOKEN_EXPIRES_IN'),
          },
        };
      },
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get<string>('AUTH_REFRESH_SECRET'),
          signOptions: {
            expiresIn: configService.get<string>(
              'AUTH_REFRESH_TOKEN_EXPIRES_IN',
            ),
          },
        };
      },
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get<string>('AUTH_FORGOT_SECRET'),
          signOptions: {
            expiresIn: configService.get<string>(
              'AUTH_FORGOT_TOKEN_EXPIRES_IN',
            ),
          },
        };
      },
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get<string>('AUTH_CONFIRM_EMAIL_SECRET'),
          signOptions: {
            expiresIn: configService.get<string>(
              'AUTH_CONFIRM_EMAIL_TOKEN_EXPIRES_IN',
            ),
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, SupabaseService, PrismaService],
  exports: [AuthService],
})
export class AuthModule {}
