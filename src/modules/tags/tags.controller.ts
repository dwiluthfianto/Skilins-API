import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  HttpCode,
  UseInterceptors,
  UploadedFile,
  HttpException,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { Tag } from './entities/tag.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { SupabaseService } from 'src/supabase';
import { ContentFileEnum } from '../contents/content-file.enum';

@ApiTags('Tag')
@Controller({ path: 'api/v1/tags', version: '1' })
export class TagsController {
  constructor(
    private readonly tagsService: TagsService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('avatar_url'))
  @ApiCreatedResponse({ type: Tag })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @UploadedFile() avatar_url: Express.Multer.File,
    @Body() createTagDto: CreateTagDto,
  ) {
    let avatarFilename: string;
    try {
      if (avatar_url && avatar_url.size > 0) {
        const { success, url, fileName, error } =
          await this.supabaseService.uploadFile(
            avatar_url,
            `skilins_storage/${ContentFileEnum.avatar}`,
          );

        if (!success) {
          throw new Error(`Failed to upload image: ${error}`);
        }

        avatarFilename = fileName;
        createTagDto.avatar_url = url;
      }
      return await this.tagsService.create(createTagDto);
    } catch (e) {
      console.error('Error during tag creation:', e.message);

      const { success, error } = await this.supabaseService.deleteFile([
        `${ContentFileEnum.avatar}${avatarFilename}`,
      ]);

      if (!success) {
        console.error('Failed to delete files:', error);
      }
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: `Tag creation failed: ${e.message}. ${avatarFilename ? 'Failed to clean up uploaded file' : ''}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOkResponse({ type: Tag })
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.tagsService.findAll();
  }

  @Get(':uuid')
  @ApiOkResponse({ type: Tag })
  @HttpCode(HttpStatus.OK)
  findOne(@Param('uuid') uuid: string) {
    return this.tagsService.findOne(uuid);
  }

  @Patch(':uuid')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('avatar_url'))
  @ApiOkResponse({ type: Tag })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('uuid') uuid: string,
    @UploadedFile() avatar_url: Express.Multer.File,
    @Body() updateTagDto: UpdateTagDto,
  ) {
    const tag = await this.tagsService.update(uuid, updateTagDto);
    if (tag.status === 'success') {
      const isExist = await this.tagsService.findOne(uuid);
      if (avatar_url && avatar_url.size > 0) {
        const avatarFilename = isExist.data.avatar_url.split('/').pop();
        const { success, error } = await this.supabaseService.updateFile(
          `${ContentFileEnum.avatar}${avatarFilename}`,
          avatar_url,
        );
        if (!success) {
          throw new Error(`Failed to update avatar: ${error}`);
        }
      }
    }

    return tag;
  }

  @Delete(':uuid')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiOkResponse({ type: Tag })
  @HttpCode(HttpStatus.OK)
  async remove(@Param('uuid') uuid: string) {
    const isExist = await this.tagsService.findOne(uuid);
    const thumbFilename = isExist?.data?.avatar_url
      ? isExist.data.avatar_url.split('/').pop().replace(/%20/g, ' ')
      : null;
    if (isExist) {
      const tag = await this.tagsService.remove(uuid);
      if (tag.status === 'success') {
        const { success, error } = await this.supabaseService.deleteFile([
          `${ContentFileEnum.avatar}${thumbFilename}`,
        ]);

        if (!success) {
          console.error('Failed to delete avatar:', error);
        }
      }
      return tag;
    }
  }
}
