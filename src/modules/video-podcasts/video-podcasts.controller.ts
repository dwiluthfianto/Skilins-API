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
  UploadedFile,
  Query,
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
import { FileInterceptor } from '@nestjs/platform-express';
import { ContentFileEnum } from '../contents/content-file.enum';
import { SupabaseService } from 'src/supabase';

@ApiTags('Contents')
@Controller({ path: 'api/v1/contents/videos', version: '1' })
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
  @UseInterceptors(FileInterceptor('thumbnail'))
  async create(
    @UploadedFile() thumbnail: Express.Multer.File,
    @Body() createVideoPodcastDto: CreateVideoPodcastDto,
  ) {
    let thumbFilename: string;
    try {
      if (thumbnail && thumbnail.size > 0) {
        const {
          success: thumbnailSuccess,
          url: thumbnailUrl,
          fileName: thumbnailFilename,
          error: thumbnailError,
        } = await this.supabaseService.uploadFile(
          thumbnail,
          `skilins_storage/${ContentFileEnum.thumbnail}`,
        );

        if (!thumbnailSuccess) {
          throw new Error(`Failed to upload thumbnail: ${thumbnailError}`);
        }

        thumbFilename = thumbnailFilename;

        createVideoPodcastDto.thumbnail = thumbnailUrl;
      }

      const result = await this.videoPodcastsService.create(
        createVideoPodcastDto,
      );
      return result;
    } catch (e) {
      console.error('Error during audio podcast creation:', e.message);

      const { success, error } = await this.supabaseService.deleteFile([
        `${ContentFileEnum.thumbnail}${thumbFilename}`,
      ]);

      if (!success) {
        console.error('Failed to delete files:', error);
      }

      return {
        message: 'Failed to create audio podcast and cleaned up uploaded ',
      };
    }
  }

  @Get()
  @ApiOkResponse({
    type: VideoPodcast,
    isArray: true,
  })
  @HttpCode(HttpStatus.OK)
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 25,
    @Query('category') category: string,
  ) {
    if (!category) {
      return this.videoPodcastsService.findAll(page, limit);
    } else {
      return this.videoPodcastsService.findByCategory(page, limit, category);
    }
  }
  @Get('latest')
  @ApiOkResponse({
    type: VideoPodcast,
    isArray: true,
  })
  @HttpCode(HttpStatus.OK)
  findLatest(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 25,
    @Query('week') week: number = 1,
  ) {
    return this.videoPodcastsService.findLatest(page, limit, week);
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
  @UseInterceptors(FileInterceptor('thumbnail'))
  @ApiOkResponse({
    type: VideoPodcast,
  })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('uuid') uuid: string,
    @UploadedFile() thumbnail: Express.Multer.File,
    @Body() updateVideoPodcastDto: UpdateVideoPodcastDto,
  ) {
    const audio = await this.videoPodcastsService.update(
      uuid,
      updateVideoPodcastDto,
    );

    if (audio.status === 'success') {
      const isExist = await this.videoPodcastsService.findOne(uuid);

      if (thumbnail && thumbnail.size > 0) {
        const thumbFilename = isExist.data.thumbnail.split('/').pop();

        const { success: thumbnailSuccess, error: thumbnailError } =
          await this.supabaseService.updateFile(
            `${ContentFileEnum.thumbnail}${thumbFilename}`,
            thumbnail[0],
          );

        if (!thumbnailSuccess) {
          throw new Error(`Failed to update thumbnail: ${thumbnailError}`);
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
    const thumbFilename = isExist?.data?.thumbnail
      ? isExist.data.thumbnail.split('/').pop().replace(/%20/g, ' ')
      : null;

    if (isExist) {
      const audio = await this.videoPodcastsService.remove(uuid);
      if (audio.status === 'success') {
        const { success, error } = await this.supabaseService.deleteFile([
          `${ContentFileEnum.thumbnail}${thumbFilename}`,
        ]);

        if (!success) {
          console.error('Failed to delete file:', error);
        }
      }
      return audio;
    }
  }
}
