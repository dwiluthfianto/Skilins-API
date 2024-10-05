import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { NovelsService } from './novels.service';
import { CreateNovelDto } from './dto/create-novel.dto';
import { UpdateNovelDto } from './dto/update-novel.dto';
import { Novel } from './entities/novel.entity';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../roles/roles.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ContentFileEnum } from '../contents/content-file.enum';
import { SupabaseService } from 'src/supabase';

@ApiTags('Contents')
@Controller({ path: 'api/contents/novels', version: '1' })
export class NovelsController {
  constructor(
    private readonly novelsService: NovelsService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiCreatedResponse({
    type: Novel,
  })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'thumbnail' }, { name: 'file_url' }]),
  )
  @HttpCode(HttpStatus.CREATED)
  async create(
    @UploadedFiles()
    files: {
      thumbnail?: Express.Multer.File[];
      file_url?: Express.Multer.File[];
    },
    @Body() createNovelDto: CreateNovelDto,
  ) {
    let thumbFilename: string;
    let fileFilename: string;
    try {
      if (files.thumbnail && files.thumbnail.length > 0) {
        const {
          success: thumbnailSuccess,
          url: thumbnailUrl,
          fileName: thumbnailFilename,
          error: thumbnailError,
        } = await this.supabaseService.uploadFile(
          files.thumbnail[0],
          `skilins_storage/${ContentFileEnum.thumbnail}`,
        );

        if (!thumbnailSuccess) {
          throw new Error(`Failed to upload thumbnail: ${thumbnailError}`);
        }

        thumbFilename = thumbnailFilename;

        createNovelDto.thumbnail = thumbnailUrl;
      }

      if (files.file_url && files.file_url.length > 0) {
        const {
          success: fileSuccess,
          url: fileUrl,
          fileName: fileUrlFilename,
          error: fileError,
        } = await this.supabaseService.uploadFile(
          files.file_url[0],
          `skilins_storage/${ContentFileEnum.file_novel}`,
        );

        if (!fileSuccess) {
          throw new Error(`Failed to upload file: ${fileError}`);
        }
        fileFilename = fileUrlFilename;
        createNovelDto.file_url = fileUrl;
      }

      const result = await this.novelsService.create(createNovelDto);
      return result;
    } catch (e) {
      console.error('Error during novel podcast creation:', e.message);

      const { success, error } = await this.supabaseService.deleteFile([
        `${ContentFileEnum.file_novel}${fileFilename}`,
        `${ContentFileEnum.thumbnail}${thumbFilename}`,
      ]);

      if (!success) {
        console.error('Failed to delete files:', error);
      }

      return {
        message:
          'Failed to create novel podcast and cleaned up uploaded files.',
      };
    }
  }

  @Get()
  @ApiOkResponse({
    type: Novel,
    isArray: true,
  })
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.novelsService.findAll();
  }

  @Get(':uuid')
  @ApiOkResponse({
    type: Novel,
  })
  @HttpCode(HttpStatus.OK)
  findOne(@Param('uuid') uuid: string) {
    return this.novelsService.findOne(uuid);
  }

  @Patch(':uuid')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiOkResponse({
    type: Novel,
  })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'thumbnail' }, { name: 'file_url' }]),
  )
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('uuid') uuid: string,
    @UploadedFiles()
    files: {
      thumbnail?: Express.Multer.File[];
      file_url?: Express.Multer.File[];
    },
    @Body() updateNovelDto: UpdateNovelDto,
  ) {
    const novel = await this.novelsService.update(uuid, updateNovelDto);

    if (novel.status === 'success') {
      const isExist = await this.novelsService.findOne(uuid);

      if (files.thumbnail && files.thumbnail.length > 0) {
        const thumbFilename = isExist.data.thumbnail.split('/').pop();

        const { success: thumbnailSuccess, error: thumbnailError } =
          await this.supabaseService.updateFile(
            `${ContentFileEnum.thumbnail}${thumbFilename}`,
            files.thumbnail[0],
          );

        if (!thumbnailSuccess) {
          throw new Error(`Failed to update thumbnail: ${thumbnailError}`);
        }
      }

      if (files.file_url && files.file_url.length > 0) {
        const fileFilename = isExist.data.file_url.split('/').pop();
        const { success: fileSuccess, error: fileError } =
          await this.supabaseService.updateFile(
            `${ContentFileEnum.file_novel}${fileFilename}`,
            files.file_url[0],
          );

        if (!fileSuccess) {
          throw new Error(`Failed to update file: ${fileError}`);
        }
      }
    }

    return novel;
  }

  @Delete(':uuid')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiOkResponse({
    type: Novel,
  })
  @HttpCode(HttpStatus.OK)
  async remove(@Param('uuid') uuid: string) {
    const isExist = await this.novelsService.findOne(uuid);
    const thumbFilename = isExist.data.thumbnail
      .split('/')
      .pop()
      .replace(/%20/g, ' ');
    const fileFilename = isExist.data.file_url
      .split('/')
      .pop()
      .replace(/%20/g, ' ');
    if (isExist) {
      const novel = await this.novelsService.remove(uuid);
      if (novel.status === 'success') {
        const { success, error } = await this.supabaseService.deleteFile([
          `${ContentFileEnum.thumbnail}${thumbFilename}`,
          `${ContentFileEnum.file_novel}${fileFilename}`,
        ]);

        if (!success) {
          console.error('Failed to delete file:', error);
        }
      }
      return novel;
    }
  }
}
