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
  Req,
  ParseFilePipeBuilder,
  Res,
} from '@nestjs/common';
import { VideoPodcastsService } from './video-podcasts.service';
import { CreateVideoPodcastDto } from './dto/create-video-podcast.dto';
import { UpdateVideoPodcastDto } from './dto/update-video-podcast.dto';
import {
  ApiBearerAuth,
  ApiConsumes,
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
import { FindContentQueryDto } from '../contents/dto/find-content-query.dto';
import { Request, Response } from 'express';

@ApiTags('Videos')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'api/v1/contents/videos', version: '1' })
export class VideoPodcastsController {
  constructor(
    private readonly videoPodcastsService: VideoPodcastsService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Staff', 'Student')
  @ApiCreatedResponse({
    type: VideoPodcast,
  })
  @UseInterceptors(FileInterceptor('thumbnail'))
  @ApiConsumes('multipart/form-data')
  async create(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: '.(png|jpeg|jpg)',
        })
        .addMaxSizeValidator({
          maxSize: 2 * 1024 * 1024,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    thumbnail: Express.Multer.File,
    @Body() createVideoPodcastDto: CreateVideoPodcastDto,
    @Res() res: Response,
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
      return res.status(HttpStatus.CREATED).json(result);
    } catch (e) {
      console.error('Error during audio podcast creation:', e.message);

      const { success, error } = await this.supabaseService.deleteFile([
        `${ContentFileEnum.thumbnail}${thumbFilename}`,
      ]);

      if (!success) {
        console.error('Failed to delete files:', error);
      }

      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'failed',
        message:
          'Failed to create video podcast and cleaned up uploaded files.',
        detail: e.message,
      });
    }
  }

  @Get()
  @ApiOkResponse({
    type: VideoPodcast,
    isArray: true,
  })
  @HttpCode(HttpStatus.OK)
  findAll(@Query() query: FindContentQueryDto) {
    return this.videoPodcastsService.fetchVideos(query);
  }

  @Get('student')
  @ApiOkResponse({
    type: VideoPodcast,
    isArray: true,
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Student')
  @HttpCode(HttpStatus.OK)
  async findUserVideo(
    @Req() req: Request,
    @Query() query: FindContentQueryDto,
  ) {
    const user = req.user;
    return await this.videoPodcastsService.fetchUserVideos(user['sub'], query);
  }

  @Get(':slug')
  @ApiOkResponse({
    type: VideoPodcast,
  })
  @HttpCode(HttpStatus.OK)
  findOne(@Param('slug') slug: string) {
    return this.videoPodcastsService.findOneBySlug(slug);
  }

  @Patch(':uuid')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Staff', 'Student')
  @UseInterceptors(FileInterceptor('thumbnail'))
  @ApiOkResponse({
    type: VideoPodcast,
  })
  @ApiConsumes('multipart/form-data')
  async update(
    @Param('uuid') uuid: string,
    @UploadedFile()
    thumbnail: Express.Multer.File,
    @Body() updateVideoPodcastDto: UpdateVideoPodcastDto,
    @Res() res: Response,
  ) {
    try {
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

      const updatedVideo = await this.videoPodcastsService.update(
        uuid,
        updateVideoPodcastDto,
      );

      return res.status(HttpStatus.OK).json(updatedVideo);
    } catch (error) {
      console.error('Error updating video:', error.message);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'failed',
        message: 'Failed to update video',
        detail: error.message,
      });
    }
  }

  @Delete(':uuid')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Staff', 'Student')
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
