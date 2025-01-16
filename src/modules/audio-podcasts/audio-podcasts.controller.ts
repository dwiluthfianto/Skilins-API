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
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { AudioPodcastsService } from './audio-podcasts.service';
import { CreateAudioPodcastDto } from './dto/create-audio-podcast.dto';
import { UpdateAudioPodcastDto } from './dto/update-audio-podcast.dto';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AudioPodcast } from './entities/audio-podcast.entity';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { SupabaseService } from 'src/supabase';
import { ContentFileEnum } from '../contents/content-file.enum';
import { FindContentQueryDto } from '../contents/dto/find-content-query.dto';
import { Request, Response } from 'express';

@ApiTags('Audios')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'api/v1/contents/audios', version: '1' })
export class AudioPodcastsController {
  constructor(
    private readonly audioPodcastsService: AudioPodcastsService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Staff', 'Student')
  @ApiCreatedResponse({
    type: AudioPodcast,
  })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'thumbnail' }, { name: 'file_url' }]),
  )
  @ApiConsumes('multipart/form-data')
  async create(
    @UploadedFiles()
    files: {
      thumbnail?: Express.Multer.File[];
      file_url?: Express.Multer.File[];
    },
    @Body() createAudioPodcastDto: CreateAudioPodcastDto,
    @Res() res: Response,
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

        createAudioPodcastDto.thumbnail = thumbnailUrl;
      }

      if (files.file_url && files.file_url.length > 0) {
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
        createAudioPodcastDto.file_url = fileUrl;
      }

      const result = await this.audioPodcastsService.create(
        createAudioPodcastDto,
      );
      return res.status(HttpStatus.CREATED).json(result);
    } catch (e) {
      console.error('Error during audio podcast creation:', e.message);

      const { success, error } = await this.supabaseService.deleteFile([
        `${ContentFileEnum.file_audio}${fileFilename}`,
        `${ContentFileEnum.thumbnail}${thumbFilename}`,
      ]);

      if (!success) {
        console.error('Failed to delete files:', error);
      }

      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'failed',
        message:
          'Failed to create audio podcast and cleaned up uploaded files.',
        detail: e.message,
      });
    }
  }

  @Get()
  @ApiOkResponse({
    type: AudioPodcast,
    isArray: true,
  })
  @HttpCode(HttpStatus.OK)
  findAll(@Query() query: FindContentQueryDto) {
    return this.audioPodcastsService.fetchAudios(query);
  }

  @Get('student')
  @ApiOkResponse({
    type: AudioPodcast,
    isArray: true,
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Student')
  @HttpCode(HttpStatus.OK)
  findUserAudio(@Req() req: Request, @Query() query: FindContentQueryDto) {
    const user = req.user;
    return this.audioPodcastsService.fetchUserAudios(user['sub'], query);
  }

  @Get(':slug')
  @ApiOkResponse({
    type: AudioPodcast,
  })
  @HttpCode(HttpStatus.OK)
  findOne(@Param('slug') slug: string) {
    return this.audioPodcastsService.findOneBySlug(slug);
  }

  @Patch(':uuid')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'thumbnail' }, { name: 'file_url' }]),
  )
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Staff', 'Student')
  @ApiOkResponse({
    type: AudioPodcast,
  })
  @ApiConsumes('multipart/form-data')
  async update(
    @Param('uuid') uuid: string,
    @UploadedFiles()
    files: {
      thumbnail?: Express.Multer.File[];
      file_url?: Express.Multer.File[];
    },
    @Body() updateAudioPodcastDto: UpdateAudioPodcastDto,
    @Res() res: Response,
  ) {
    try {
      const currentAudio = await this.audioPodcastsService.findOne(uuid);

      if (!currentAudio) {
        return res.status(HttpStatus.NOT_FOUND).json({
          status: 'failed',
          message: 'Ebook not found',
        });
      }
      if (files.thumbnail && files.thumbnail.length > 0) {
        const thumbFilename = currentAudio.data.thumbnail.split('/').pop();

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
        const fileFilename = currentAudio.data.file_url.split('/').pop();
        const { success: fileSuccess, error: fileError } =
          await this.supabaseService.updateFile(
            `${ContentFileEnum.file_audio}${fileFilename}`,
            files.file_url[0],
          );

        if (!fileSuccess) {
          throw new Error(`Failed to update file: ${fileError}`);
        }
      }

      const updatedAudio = await this.audioPodcastsService.update(
        uuid,
        updateAudioPodcastDto,
      );

      return res.status(HttpStatus.OK).json(updatedAudio);
    } catch (error) {
      console.error('Error updating audio:', error.message);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'failed',
        message: 'Failed to update audio',
        detail: error.message,
      });
    }
  }

  @Delete(':uuid')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Staff', 'Student')
  @ApiOkResponse({
    type: AudioPodcast,
  })
  @HttpCode(HttpStatus.OK)
  async remove(@Param('uuid') uuid: string) {
    const isExist = await this.audioPodcastsService.findOne(uuid);
    const thumbFilename = isExist.data.thumbnail
      .split('/')
      .pop()
      .replace(/%20/g, ' ');
    const fileFilename = isExist.data.file_url
      .split('/')
      .pop()
      .replace(/%20/g, ' ');
    if (isExist) {
      const audio = await this.audioPodcastsService.remove(uuid);
      if (audio.status === 'success') {
        const { success, error } = await this.supabaseService.deleteFile([
          `${ContentFileEnum.file_audio}${fileFilename}`,
          `${ContentFileEnum.thumbnail}${thumbFilename}`,
        ]);

        if (!success) {
          console.error('Failed to delete thumbnail and file', error);
        }
      }
      return audio;
    }
  }
}
