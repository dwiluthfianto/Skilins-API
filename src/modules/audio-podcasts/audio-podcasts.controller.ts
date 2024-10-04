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
  UseInterceptors,
  UseGuards,
  UploadedFiles,
} from '@nestjs/common';
import { AudioPodcastsService } from './audio-podcasts.service';
import { CreateAudioPodcastDto } from './dto/create-audio-podcast.dto';
import { UpdateAudioPodcastDto } from './dto/update-audio-podcast.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AudioPodcast } from './entities/audio-podcast.entity';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { SupabaseService } from 'src/supabase';
import { ContentFileEnum } from '../contents/content-file.enum';

@ApiTags('Contents')
@Controller({ path: 'api/contents/audios', version: '1' })
export class AudioPodcastsController {
  constructor(
    private readonly audioPodcastsService: AudioPodcastsService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiCreatedResponse({
    type: AudioPodcast,
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
    @Body() createAudioPodcastDto: CreateAudioPodcastDto,
  ) {
    let thumbFilename: string;
    let fileFilename: string;
    try {
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

      const {
        success: fileSuccess,
        url: fileUrl,
        fileName: fileUrlFilename,
        error: fileError,
      } = await this.supabaseService.uploadFile(
        files.file_url[0],
        `skilins_storage/${ContentFileEnum.file_audio}`,
      );

      if (!fileSuccess) {
        throw new Error(`Failed to upload file: ${fileError}`);
      }

      fileFilename = fileUrlFilename;
      thumbFilename = thumbnailFilename;

      createAudioPodcastDto.thumbnail = thumbnailUrl;
      createAudioPodcastDto.file_url = fileUrl;

      const result = await this.audioPodcastsService.create(
        createAudioPodcastDto,
      );
      return result;
    } catch (e) {
      console.error('Error during audio podcast creation:', e.message);

      const { success, error } = await this.supabaseService.deleteFile([
        `${ContentFileEnum.file_audio}${fileFilename}`,
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
    type: AudioPodcast,
    isArray: true,
  })
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.audioPodcastsService.findAll();
  }

  @Get(':uuid')
  @ApiOkResponse({
    type: AudioPodcast,
  })
  @HttpCode(HttpStatus.OK)
  findOne(@Param('uuid') uuid: string) {
    return this.audioPodcastsService.findOne(uuid);
  }

  @Patch(':uuid')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'thumbnail' }, { name: 'file_url' }]),
  )
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiOkResponse({
    type: AudioPodcast,
  })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('uuid') uuid: string,
    @UploadedFiles()
    files: {
      thumbnail?: Express.Multer.File[];
      file_url?: Express.Multer.File[];
    },
    @Body() updateAudioPodcastDto: UpdateAudioPodcastDto,
  ) {
    const audio = await this.audioPodcastsService.update(
      uuid,
      updateAudioPodcastDto,
    );

    if (audio.status === 'success') {
      const isExist = await this.audioPodcastsService.findOne(uuid);

      const thumbFilename = isExist.data.thumbnail.split('/').pop();
      const fileFilename = isExist.data.file_url.split('/').pop();

      const { success: thumbnailSuccess, error: thumbnailError } =
        await this.supabaseService.updateFile(
          `${ContentFileEnum.thumbnail}${thumbFilename}`,
          files.thumbnail[0],
        );

      if (!thumbnailSuccess) {
        throw new Error(`Failed to update thumbnail: ${thumbnailError}`);
      }

      const { success: fileSuccess, error: fileError } =
        await this.supabaseService.updateFile(
          `${ContentFileEnum.file_audio}${fileFilename}`,
          files.file_url[0],
        );

      if (!fileSuccess) {
        throw new Error(`Failed to update file: ${fileError}`);
      }
    }
  }

  @Delete(':uuid')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiOkResponse({
    type: AudioPodcast,
  })
  @HttpCode(HttpStatus.OK)
  remove(@Param('uuid') uuid: string) {
    return this.audioPodcastsService.remove(uuid);
  }
}
