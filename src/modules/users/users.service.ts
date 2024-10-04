import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RoleUserDto } from './dto/role-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(uuid: string) {
    return await this.prisma.users.findUniqueOrThrow({
      where: { uuid },
      include: { roles: true }, // Include role information
    });
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

  // Update the refresh token in the database
  async updateRefreshToken(uuid: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    // Update the user's refresh token in the database
    await this.prisma.users.update({
      where: { uuid },
      data: {
        refreshToken: hashedRefreshToken,
      },
    });
  }

  // Clear refresh token (when logging out)
  async clearRefreshToken(uuid: string): Promise<void> {
    await this.prisma.users.update({
      where: { uuid },
      data: {
        refreshToken: null, // Clear the refresh token
      },
    });
  }
}
