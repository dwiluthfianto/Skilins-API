import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SupabaseService } from 'src/supabase';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { AuthRegisterLoginDto } from './dto/auth-register-login.dto';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  // User login
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
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '15m',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: '7d',
    });

    await this.userService.updateRefreshToken(user.uuid, refreshToken);
    return {
      accessToken,
      refreshToken,
      data: {
        uuid: user.uuid,
        username: user.username,
        email: user.email,
      },
    };
  }

  // User registration
  async register(authRegisterLoginDto: AuthRegisterLoginDto) {
    const hashedPassword = await bcrypt.hash(authRegisterLoginDto.password, 10);

    const role = await this.prisma.roles.findUniqueOrThrow({
      where: { name: authRegisterLoginDto.role },
    });

    const user = await this.prisma.users.create({
      data: {
        email: authRegisterLoginDto.email,
        password: hashedPassword,
        username: authRegisterLoginDto.username,
        full_name: authRegisterLoginDto.full_name,
        roles: { connect: { uuid: role.uuid } },
      },
    });

    return {
      status: 'success',
      message: 'register successfully!',
      data: {
        uuid: user.uuid,
      },
    };
  }

  async validateUser(uuid: string) {
    console.log(uuid);

    const user = await this.prisma.users.findUniqueOrThrow({
      where: { uuid },
      include: { roles: true },
    });

    return user;
  }

  async refreshTokens(refreshToken: string) {
    const decoded = this.jwtService.decode(refreshToken) as any;

    // Check if we can extract the UUID from the token payload
    if (!decoded || !decoded.sub) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Find user by UUID (sub in JWT payload)
    const user = await this.userService.findOne(decoded.sub);

    if (!user || !(await this.validateRefreshToken(user.uuid, refreshToken))) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const payload = {
      email: user.email,
      sub: user.uuid,
      role: user.roles.name,
    };
    // Generate new access and refresh tokens
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '15m',
    });
    const newRefreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: '7d',
    });

    // Update refresh token in database
    await this.userService.updateRefreshToken(user.uuid, newRefreshToken);

    return { accessToken, newRefreshToken };
  }

  async validateRefreshToken(
    uuid: string,
    refreshToken: string,
  ): Promise<boolean> {
    const user = await this.prisma.users.findUnique({ where: { uuid } });

    if (!user || !user.refreshToken) return false;

    // Compare the stored (hashed) token with the one provided by the user
    return bcrypt.compare(refreshToken, user.refreshToken);
  }

  async logout(uuid: string): Promise<void> {
    await this.userService.clearRefreshToken(uuid);
  }
}
