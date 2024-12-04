import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { AuthRegisterLoginDto } from './dto/auth-register-login.dto';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { AuthForgotPasswordDto } from './dto/auth-forgot-password.dto';
import { AuthResetPasswordDto } from './dto/auth-reset-password.dto';
import ms from 'ms';
import { AuthChangePasswordDto } from './dto/auth-change-password.dto';
import { RoleType } from '@prisma/client';
import { AuthRegisterStudentDto } from './dto/auth-register-student.dto';

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
      this.logger.log(e);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  // Mengirim email untuk reset password
  async sendPasswordResetEmail(authForgotPasswordDto: AuthForgotPasswordDto) {
    const { email } = authForgotPasswordDto;
    const user = await this.prisma.users.findUniqueOrThrow({
      where: { email },
      include: { roles: true },
    });

    const token = this.jwtService.sign(
      { email: user.email, sub: user.uuid, role: user.roles.name },
      {
        secret: this.configService.get<string>('AUTH_FORGOT_SECRET'),
        expiresIn: this.configService.get<string>(
          'AUTH_FORGOT_TOKEN_EXPIRES_IN',
        ),
      },
    );

    const resetTokenExpires = new Date(
      Date.now() +
        ms(this.configService.get<string>('AUTH_FORGOT_TOKEN_EXPIRES_IN')),
    );

    const hashedToken = await bcrypt.hash(token, 10);
    await this.prisma.users.update({
      where: { email: user.email },
      data: {
        resetPasswordToken: hashedToken,
        resetTokenExpires,
      },
    });

    const resetUrl = `${process.env.FRONTEND_DOMAIN}/auth/reset-password?token=${token}`;

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
  async resetPassword(authResetPasswordDto: AuthResetPasswordDto) {
    const { password: newPassword, token } = authResetPasswordDto;
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

      const isTokenValid = await bcrypt.compare(token, user.resetPasswordToken);
      if (!isTokenValid) {
        throw new UnauthorizedException('Invalid token');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await this.prisma.users.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetPasswordToken: null,
          resetTokenExpires: null,
        },
      });
    } catch (e) {
      this.logger.log(e);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async changePassword(authChangePassworddDto: AuthChangePasswordDto) {
    const { email, currentPassword, newPassword } = authChangePassworddDto;
    const user = await this.prisma.users.findUniqueOrThrow({
      where: { email },
    });

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Oops! The current password you entered is incorrect. Please verify and try again.',
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.users.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetTokenExpires: null,
      },
    });

    return {
      status: 'success',
      message: 'Password changed successfully',
    };
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
      where: { name: RoleType.User },
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

  async registerStudent(authRegisterStudentDto: AuthRegisterStudentDto) {
    const hashedPassword = await bcrypt.hash(
      authRegisterStudentDto.password,
      10,
    );

    const role = await this.prisma.roles.findUniqueOrThrow({
      where: { name: RoleType.User },
    });

    const user = await this.prisma.users.create({
      data: {
        email: authRegisterStudentDto.email,
        password: hashedPassword,
        full_name: authRegisterStudentDto.full_name,
        emailVerified: false,
        roles: { connect: { uuid: role.uuid } },
      },
    });

    await this.prisma.students.create({
      data: {
        nis: authRegisterStudentDto.nis,
        name: authRegisterStudentDto.name,
        birthdate: authRegisterStudentDto.birthdate,
        birthplace: authRegisterStudentDto.birthplace,
        sex: authRegisterStudentDto.sex,
        user: { connect: { uuid: user.uuid } },
        major: { connect: { name: authRegisterStudentDto.major } },
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
