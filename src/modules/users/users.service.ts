import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RoleUserDto } from './dto/role-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(uuid: string) {
    const user = await this.prisma.users.findUniqueOrThrow({
      where: { uuid },
      include: { roles: true },
    });

    return {
      status: 'success',
      data: {
        uuid: user.uuid,
        profile: user.profile_url,
        email: user.email,
        full_name: user.full_name,
        email_verified: user.emailVerified,
        role: user.roles.name,
      },
    };
  }
  async removeUser(uuid: string) {
    const user = await this.prisma.users.findUniqueOrThrow({
      where: { uuid },
    });

    await this.prisma.users.delete({
      where: { uuid: user.uuid },
    });

    return {
      status: 'success',
      message: 'Account removed successfully!',
    };
  }

  async assignRoleToUser(roleUser: RoleUserDto) {
    return await this.prisma.users.update({
      where: { uuid: roleUser.uuid },
      data: { roles: { connect: { name: roleUser.role } } },
    });
  }

  async findAll() {
    return await this.prisma.users.findMany({
      include: { roles: true },
    });
  }

  async updateRefreshToken(uuid: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await this.prisma.users.update({
      where: { uuid },
      data: {
        refreshToken: hashedRefreshToken,
      },
    });
  }

  async clearRefreshToken(uuid: string): Promise<void> {
    await this.prisma.users.update({
      where: { uuid },
      data: {
        refreshToken: null,
      },
    });
  }

  async updateProfile(uuid: string, profile: string): Promise<void> {
    await this.prisma.users.update({
      where: { uuid },
      data: {
        profile_url: profile,
      },
    });
  }
}
