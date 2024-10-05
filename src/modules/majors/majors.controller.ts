import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { MajorsService } from './majors.service';
import { CreateMajorDto } from './dto/create-major.dto';
import { UpdateMajorDto } from './dto/update-major.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Major } from './entities/major.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { SupabaseService } from 'src/supabase';
import { ContentFileEnum } from '../contents/content-file.enum';
@ApiTags('Major')
@Controller({ path: 'api/v1/majors', version: '1' })
@Roles('admin')
export class MajorsController {
  constructor(
    private readonly majorsService: MajorsService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Post()
  @ApiCreatedResponse({
    type: Major,
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'image_url' }, { name: 'avatar_url' }]),
  )
  @HttpCode(HttpStatus.CREATED)
  async create(
    @UploadedFiles()
    files: {
      image_url?: Express.Multer.File[];
      avatar_url?: Express.Multer.File[];
    },
    @Body() createMajorDto: CreateMajorDto,
  ) {
    let imageFilename: string;
    let avatarFilename: string;
    try {
      if (files.image_url && files.image_url.length > 0) {
        const { success, url, fileName, error } =
          await this.supabaseService.uploadFile(
            files.image_url[0],
            `skilins_storage/${ContentFileEnum.major}`,
          );

        if (!success) {
          throw new Error(`Failed to upload image: ${error}`);
        }

        imageFilename = fileName;
        createMajorDto.image_url = url;
      }

      if (files.avatar_url && files.avatar_url.length > 0) {
        const {
          success: fileSuccess,
          url: fileUrl,
          fileName: fileUrlFilename,
          error: fileError,
        } = await this.supabaseService.uploadFile(
          files.avatar_url[0],
          `skilins_storage/${ContentFileEnum.avatar}`,
        );

        if (!fileSuccess) {
          throw new Error(`Failed to upload file: ${fileError}`);
        }
        avatarFilename = fileUrlFilename;
        createMajorDto.avatar_url = fileUrl;
      }
      const major = await this.majorsService.create(createMajorDto);
      return major;
    } catch (e) {
      console.error('Error during audio podcast creation:', e.message);

      const { success, error } = await this.supabaseService.deleteFile([
        `${ContentFileEnum.major}${imageFilename}`,
        `${ContentFileEnum.avatar}${avatarFilename}`,
      ]);

      if (!success) {
        console.error('Failed to delete files:', error);
      }

      return {
        message: 'Failed to create major and cleaned up uploaded files.',
      };
    }
  }

  @Get()
  @ApiOkResponse({
    type: Major,
    isArray: true,
  })
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.majorsService.findAll();
  }

  @Get(':uuid')
  @ApiOkResponse({
    type: Major,
  })
  @HttpCode(HttpStatus.OK)
  findOne(@Param('uuid') uuid: string) {
    return this.majorsService.findOne(uuid);
  }

  @Patch(':uuid')
  @ApiOkResponse({
    type: Major,
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'image_url' }, { name: 'avatar_url' }]),
  )
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('uuid') uuid: string,
    @UploadedFiles()
    files: {
      image_url?: Express.Multer.File[];
      avatar_url?: Express.Multer.File[];
    },
    @Body() updateMajorDto: UpdateMajorDto,
  ) {
    const major = await this.majorsService.update(uuid, updateMajorDto);

    if (major.status === 'success') {
      const isExist = await this.majorsService.findOne(uuid);
      if (files.avatar_url && files.avatar_url.length > 0) {
        const avatarFilename = isExist.data.avatar_url.split('/').pop();
        const { success, error } = await this.supabaseService.updateFile(
          `${ContentFileEnum.avatar}${avatarFilename}`,
          files.avatar_url[0],
        );
        if (!success) {
          throw new Error(`Failed to update avatar: ${error}`);
        }
      }
      if (files.image_url && files.image_url.length > 0) {
        const imageFilename = isExist.data.image_url.split('/').pop();
        const { success, error } = await this.supabaseService.updateFile(
          `${ContentFileEnum.major}${imageFilename}`,
          files.image_url[0],
        );
        if (!success) {
          throw new Error(`Failed to update avatar: ${error}`);
        }
      }
    }

    return major;
  }

  @Delete(':uuid')
  @ApiOkResponse({
    type: Major,
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('uuid') uuid: string) {
    const isExist = await this.majorsService.findOne(uuid);
    const avatarFilename = isExist.data.avatar_url
      .split('/')
      .pop()
      .replace(/%20/g, ' ');
    const imageFilename = isExist.data.image_url
      .split('/')
      .pop()
      .replace(/%20/g, ' ');
    if (isExist) {
      const major = await this.majorsService.remove(uuid);
      if (major.status === 'success') {
        const { success, error } = await this.supabaseService.deleteFile([
          `${ContentFileEnum.avatar}${avatarFilename}`,
          `${ContentFileEnum.major}${imageFilename}`,
        ]);

        if (!success) {
          console.error('Failed to delete image:', error);
        }
      }
      return major;
    }
  }
}
