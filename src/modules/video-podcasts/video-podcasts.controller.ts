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
import { VideoPodcastsService } from './video-podcasts.service';
import { CreateVideoPodcastDto } from './dto/create-video-podcast.dto';
import { UpdateVideoPodcastDto } from './dto/update-video-podcast.dto';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { VideoPodcast } from './entities/video-podcast.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ContentFileEnum } from '../contents/content-file.enum';
import { SupabaseService } from 'src/supabase';

@ApiTags('Contents')
@Controller({ path: 'api/contents/videos', version: '1' })
export class VideoPodcastsController {
  constructor(
    private readonly videoPodcastsService: VideoPodcastsService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiCreatedResponse({
    type: VideoPodcast,
  })
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'thumbnail' }, { name: 'file_url' }]),
  )
  async create(
    @UploadedFiles()
    files: {
      thumbnail?: Express.Multer.File[];
      file_url?: Express.Multer.File[];
    },
    @Body() createVideoPodcastDto: CreateVideoPodcastDto,
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

        createVideoPodcastDto.thumbnail = thumbnailUrl;
      }

      if (files.file_url && files.file_url.length > 0) {
        const {
          success: fileSuccess,
          url: fileUrl,
          fileName: fileUrlFilename,
          error: fileError,
        } = await this.supabaseService.uploadFile(
          files.file_url[0],
          `skilins_storage/${ContentFileEnum.file_video}`,
        );

        if (!fileSuccess) {
          throw new Error(`Failed to upload file: ${fileError}`);
        }
        fileFilename = fileUrlFilename;
        createVideoPodcastDto.file_url = fileUrl;
      }

      const result = await this.videoPodcastsService.create(
        createVideoPodcastDto,
      );
      return result;
    } catch (e) {
      console.error('Error during audio podcast creation:', e.message);

      const { success, error } = await this.supabaseService.deleteFile([
        `${ContentFileEnum.file_video}${fileFilename}`,
        `${ContentFileEnum.thumbnail}${thumbFilename}`,
      ]);

      if (!success) {
        console.error('Failed to delete files:', error);
      }

      return {
        message:
          'Failed to create audio podcast and cleaned up uploaded files.',
      };
    }
  }

  @Get()
  @ApiOkResponse({
    type: VideoPodcast,
    isArray: true,
  })
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.videoPodcastsService.findAll();
  }

  @Get(':uuid')
  @ApiOkResponse({
    type: VideoPodcast,
  })
  @HttpCode(HttpStatus.OK)
  findOne(@Param('uuid') uuid: string) {
    return this.videoPodcastsService.findOne(uuid);
  }

  @Patch(':uuid')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'thumbnail' }, { name: 'file_url' }]),
  )
  @ApiOkResponse({
    type: VideoPodcast,
  })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('uuid') uuid: string,
    @UploadedFiles()
    files: {
      thumbnail?: Express.Multer.File[];
      file_url?: Express.Multer.File[];
    },
    @Body() updateVideoPodcastDto: UpdateVideoPodcastDto,
  ) {
    const audio = await this.videoPodcastsService.update(
      uuid,
      updateVideoPodcastDto,
    );

    if (audio.status === 'success') {
      const isExist = await this.videoPodcastsService.findOne(uuid);

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
            `${ContentFileEnum.file_video}${fileFilename}`,
            files.file_url[0],
          );

        if (!fileSuccess) {
          throw new Error(`Failed to update file: ${fileError}`);
        }
      }
    }

    return audio;
  }

  @Delete(':uuid')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully deleted.',
  })
  @HttpCode(HttpStatus.OK)
  async remove(@Param('uuid') uuid: string) {
    const isExist = await this.videoPodcastsService.findOne(uuid);
    const thumbFilename = isExist.data.thumbnail
      .split('/')
      .pop()
      .replace(/%20/g, ' ');
    const fileFilename = isExist.data.file_url
      .split('/')
      .pop()
      .replace(/%20/g, ' ');
    if (isExist) {
      const audio = await this.videoPodcastsService.remove(uuid);
      if (audio.status === 'success') {
        const { success, error } = await this.supabaseService.deleteFile([
          `${ContentFileEnum.thumbnail}${thumbFilename}`,
          `${ContentFileEnum.file_video}${fileFilename}`,
        ]);

        if (!success) {
          console.error('Failed to delete file:', error);
        }
      }
      return audio;
    }
  }
}
