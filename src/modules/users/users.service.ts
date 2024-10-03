import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RoleUserDto } from './dto/role-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // Get user by UUID
  async getUserByUuid(uuid: string) {
    return this.prisma.users.findUnique({
      where: { uuid },
      include: { roles: true }, // Include role information
    });
  }

  // Assign a role to a user
  async assignRoleToUser(roleUser: RoleUserDto) {
    return this.prisma.users.update({
      where: { uuid: roleUser.uuid },
      data: { roles: { connect: { name: roleUser.role } } },
    });
  }

  async getAllUsers() {
    return this.prisma.users.findMany({
      include: { roles: true },
    });
  }
}
