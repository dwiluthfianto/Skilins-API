import {
  Injectable,
  UnauthorizedException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SupabaseService } from 'src/supabase';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { AuthRegisterLoginDto } from './dto/auth-register-login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // User login
  async login(authEmailLoginDto: AuthEmailLoginDto) {
    const user = await this.prisma.users.findUnique({
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
      secret: this.configService.get('JWT_SECRET'),
    });

    return {
      accessToken,
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

    const role = await this.prisma.roles.findUnique({
      where: { name: authRegisterLoginDto.role },
    });

    if (!role) {
      throw new NotFoundException(
        `Role with name ${authRegisterLoginDto.role} does not exist`,
      );
    }

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

  async validateUser(userId: string) {
    const user = await this.prisma.users.findUnique({
      where: { uuid: userId },
      include: { roles: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
