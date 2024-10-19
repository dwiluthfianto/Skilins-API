import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { AuthRegisterLoginDto } from './dto/auth-register-login.dto';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {}

  async sendVerificationEmail(uuid: string) {
    const user = await this.prisma.users.findUniqueOrThrow({
      where: { uuid },
      include: { roles: true },
    });

    const token = this.jwtService.sign(
      { email: user.email, sub: user.uuid, role: user.roles.name },
      {
        secret: this.configService.get<string>('AUTH_CONFIRM_EMAIL_SECRET'),
        expiresIn: this.configService.get<string>(
          'AUTH_CONFIRM_EMAIL_TOKEN_EXPIRES_IN',
        ),
      },
    );
    const verificationUrl = `${process.env.FRONTEND_DOMAIN}/auth/verify-email?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Email Verification',
      template: './email-verification',
      context: {
        name: user.email,
        url: verificationUrl,
      },
    });

    this.logger.log(`Verification email sent to ${user.email}`);
  }

  // Verifikasi email berdasarkan token
  async verifyEmail(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('AUTH_CONFIRM_EMAIL_SECRET'),
      });
      const user = await this.prisma.users.findUniqueOrThrow({
        where: { uuid: payload.sub },
      });

      await this.prisma.users.update({
        where: { uuid: user.uuid },
        data: { emailVerified: true },
      });

      this.logger.log(`User ${user.email} has been verified`);
      return {
        status: 'success',
        message: 'Verification successful!',
      };
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  // Mengirim email untuk reset password
  async sendPasswordResetEmail(email: string) {
    const user = await this.prisma.users.findUniqueOrThrow({
      where: { email },
      include: { roles: true },
    });

    const token = this.jwtService.sign(
      { email: user.email, sub: user.uuid, role: user.roles.name },
      {
        secret: this.configService.get<string>('AUTH_FORGOT_SECRET'), // Menggunakan secret
        expiresIn: this.configService.get<string>(
          'AUTH_FORGOT_TOKEN_EXPIRES_IN',
        ),
      },
    );
    const resetUrl = `${process.env.FRONTEND_DOMAIN}/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Password Reset',
      template: './password-reset',
      context: {
        name: user.email,
        url: resetUrl,
      },
    });
  }

  // Reset password berdasarkan token
  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('AUTH_FORGOT_SECRET'),
      });
      const user = await this.prisma.users.findUniqueOrThrow({
        where: { uuid: payload.sub },
      });

      if (user.resetTokenExpires && user.resetTokenExpires < new Date()) {
        throw new UnauthorizedException('Token has expired');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await this.prisma.users.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  // Mengganti email pengguna
  async changeEmail(uuid: string, newEmail: string) {
    await this.prisma.users.findUniqueOrThrow({
      where: { email: newEmail },
    });

    await this.prisma.users.update({
      where: { uuid },
      data: { email: newEmail, emailVerified: false },
    });

    await this.sendVerificationEmail(uuid);
  }

  async login(
    authEmailLoginDto: AuthEmailLoginDto,
  ): Promise<{ accessToken?: string; refreshToken?: string; data?: any }> {
    const user = await this.prisma.users.findUniqueOrThrow({
      where: { email: authEmailLoginDto.email },
      include: { roles: true },
    });

    if (
      !user ||
      !(await bcrypt.compare(authEmailLoginDto.password, user.password))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      email: user.email,
      sub: user.uuid,
      role: user.roles.name,
    };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('AUTH_JWT_SECRET'),
      expiresIn: this.configService.get<string>('AUTH_JWT_TOKEN_EXPIRES_IN'),
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('AUTH_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>(
        'AUTH_REFRESH_TOKEN_EXPIRES_IN',
      ),
    });

    await this.userService.updateRefreshToken(user.uuid, refreshToken);
    return {
      accessToken,
      refreshToken,
      data: {
        uuid: user.uuid,
        email: user.email,
      },
    };
  }

  async register(authRegisterLoginDto: AuthRegisterLoginDto) {
    const hashedPassword = await bcrypt.hash(authRegisterLoginDto.password, 10);

    const role = await this.prisma.roles.findUniqueOrThrow({
      where: { name: authRegisterLoginDto.role },
    });

    const user = await this.prisma.users.create({
      data: {
        email: authRegisterLoginDto.email,
        password: hashedPassword,
        full_name: authRegisterLoginDto.full_name,
        emailVerified: false,
        roles: { connect: { uuid: role.uuid } },
      },
    });

    await this.sendVerificationEmail(user.uuid);

    return {
      status: 'success',
      message:
        'Register successful! Please check your email to verify your account.',
      data: {
        uuid: user.uuid,
      },
    };
  }

  async validateUser(uuid: string) {
    const user = await this.prisma.users.findUniqueOrThrow({
      where: { uuid },
      include: { roles: true },
    });

    return user;
  }

  async refreshTokens(refreshToken: string) {
    const decoded = this.jwtService.decode(refreshToken) as any;

    if (!decoded || !decoded.sub) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userService.findOne(decoded.sub);

    if (
      !user ||
      !(await this.validateRefreshToken(user.data.uuid, refreshToken))
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const payload = {
      email: user.data.email,
      sub: user.data.uuid,
      role: user.data.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('AUTH_JWT_SECRET'),
      expiresIn: this.configService.get<string>('AUTH_JWT_TOKEN_EXPIRES_IN'),
    });
    const newRefreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('AUTH_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>(
        'AUTH_REFRESH_TOKEN_EXPIRES_IN',
      ),
    });

    await this.userService.updateRefreshToken(user.data.uuid, newRefreshToken);

    return { accessToken, newRefreshToken };
  }

  async validateRefreshToken(
    uuid: string,
    refreshToken: string,
  ): Promise<boolean> {
    const user = await this.prisma.users.findUnique({ where: { uuid } });

    if (!user || !user.refreshToken) return false;

    return bcrypt.compare(refreshToken, user.refreshToken);
  }

  async logout(uuid: string): Promise<void> {
    await this.userService.clearRefreshToken(uuid);
  }

  async getLoginUser(uuid: string) {
    return await this.userService.findOne(uuid);
  }
}
