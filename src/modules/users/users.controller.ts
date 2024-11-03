import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  UseGuards,
  Res,
  Req,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  UploadedFile,
  HttpException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RoleUserDto } from './dto/role-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ContentFileEnum } from '../contents/content-file.enum';
import { SupabaseService } from 'src/supabase';

@ApiTags('User')
@Controller({ path: 'api/v1/users', version: '1' })
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Get(':uuid')
  @Roles('Admin', 'User', 'Staff', 'Judge', 'Student')
  async getUserByUuid(@Param('uuid') uuid: string) {
    return this.usersService.findOne(uuid);
  }

  @Post('assign-role')
  @Roles('Admin')
  async assignRole(@Body() roleUserDto: RoleUserDto) {
    return this.usersService.assignRoleToUser(roleUserDto);
  }

  @Post('remove-account')
  @Roles('Admin', 'User', 'Student', 'Staff')
  async removeUser(@Req() req: Request, @Res() res: Response) {
    const user = req.user;
    await this.usersService.removeUser(user['sub']);
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: false,
    });

    return res.json({ status: 'success', message: 'Logged out successfully!' });
  }

  @Post('update-profile/:uuid')
  @Roles('Admin', 'User', 'Student', 'Staff')
  @UseInterceptors(FileInterceptor('profile_url'))
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @Param('uuid') uuid: string,
    @UploadedFile() profile_url: Express.Multer.File,
  ) {
    let profileFilename: string;
    let profileUrl: string;
    const user = await this.usersService.findOne(uuid);
    try {
      if (profile_url && profile_url.size > 0) {
        if (user.data.profile === null) {
          const { success, url, fileName, error } =
            await this.supabaseService.uploadFile(
              profile_url,
              `skilins_storage/${ContentFileEnum.profile}`,
            );

          if (!success) {
            throw new Error(`Failed to upload image: ${error}`);
          }

          profileFilename = fileName;
          profileUrl = url;
          return await this.usersService.updateProfile(uuid, profileUrl);
        }

        if (user.data.profile !== null) {
          profileFilename = user.data.profile.split('/').pop();
          const { success, error } = await this.supabaseService.updateFile(
            `${ContentFileEnum.profile}${profileFilename}`,
            profile_url,
          );
          if (!success) {
            throw new Error(`Failed to update image: ${error}`);
          }

          return {
            status: 'success',
            message: 'Image changed successfully!',
          };
        }
      }
    } catch (e) {
      console.error('Error during tag creation:', e.message);

      const { success, error } = await this.supabaseService.deleteFile([
        `${ContentFileEnum.avatar}${profileFilename}`,
      ]);

      if (!success) {
        console.error('Failed to delete files:', error);
      }
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: `Update profile failed: ${e.message}. ${profileFilename ? 'Failed to clean up uploaded file' : ''}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @Roles('Admin')
  async getAllUsers() {
    return this.usersService.findAll();
  }
}
