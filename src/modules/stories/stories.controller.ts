import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpException,
} from '@nestjs/common';
import { StoriesService } from './stories.service';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import { AddStoryEpisodeDto } from './dto/add-episode-story.dto.ts';
import { Request } from 'express';
import { UpdateStoryEpisodeDto } from './dto/update-episode-story.dto.ts';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { FindContentQueryDto } from '../contents/dto/find-content-query.dto';
import { ContentUserDto } from '../contents/dto/content-user.dto';
import { ContentStatus } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { SupabaseService } from 'src/supabase';
import { ContentFileEnum } from '../contents/content-file.enum';

@ApiTags('Contents')
@Controller({ path: 'api/v1/contents/stories', version: '1' })
export class StoriesController {
  constructor(
    private readonly storiesService: StoriesService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @UseInterceptors(FileInterceptor('thumbnail'))
  @Roles('Student')
  async createStory(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: '.(png|jpeg|jpg)',
        })
        .addMaxSizeValidator({
          maxSize: 500 * 1024,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    thumbnail: Express.Multer.File,
    @Body() createStoryDto: CreateStoryDto,
  ) {
    let thumbnailFilename: string;
    try {
      if (thumbnail && thumbnail.size > 0) {
        const { success, url, fileName, error } =
          await this.supabaseService.uploadFile(
            thumbnail,
            `skilins_storage/${ContentFileEnum.thumbnail}`,
          );

        if (!success) {
          throw new Error(`Failed to upload image: ${error}`);
        }

        thumbnailFilename = fileName;
        createStoryDto.thumbnail = url;
      }
      return await this.storiesService.create(createStoryDto);
    } catch (e) {
      console.error('Error during Blog creation:', e.message);

      const { success, error } = await this.supabaseService.deleteFile([
        `${ContentFileEnum.thumbnail}${thumbnailFilename}`,
      ]);

      if (!success) {
        console.error('Failed to delete files:', error);
      }
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: `Story creation failed: ${e.message}. ${thumbnailFilename ? 'Failed to clean up uploaded file' : ''}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':storyUuid/episodes')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Student')
  addEpisodeToStory(
    @Param('storyUuid') storyUuid: string,
    @Req() req: Request,
    @Body() addStoryEpisodeDto: AddStoryEpisodeDto,
  ) {
    const user = req.user;
    const authorUuid = user['sub'];
    return this.storiesService.addEpisode(
      storyUuid,
      authorUuid,
      addStoryEpisodeDto,
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Query() query: FindContentQueryDto) {
    const { page, limit, category, tag, genre, search } = query;

    if (category) {
      return this.storiesService.findByCategory(page, limit, category);
    }

    if (tag) {
      return this.storiesService.findByTag(page, limit, tag);
    }

    if (genre) {
      return this.storiesService.findByGenre(page, limit, genre);
    }

    return this.storiesService.findAll(page, limit, search);
  }

  @Get('student')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Student')
  @HttpCode(HttpStatus.OK)
  async findUserStories(@Req() req: Request, @Query() query: ContentUserDto) {
    const user = req.user;
    const { page, limit, status } = query;
    return await this.storiesService.findUserContent(
      user['sub'],
      page,
      limit,
      status,
    );
  }

  @Get('latest')
  @HttpCode(HttpStatus.OK)
  findLatest(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 25,
    @Query('week') week: number = 1,
    @Query('status') status: ContentStatus,
  ) {
    return this.storiesService.findLatest(page, limit, week, status);
  }

  @Get(':slug')
  getStoryWithEpisodes(@Param('slug') slug: string) {
    return this.storiesService.getStoryBySlug(slug);
  }

  @Get('episodes/:slug')
  getOneEpisode(@Param('slug') slug: string, @Query('order') order: number) {
    return this.storiesService.getOneEpisode(slug, order);
  }

  @Patch('episodes/:episodeUuid')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Student')
  updateEpisode(
    @Param('episodeUuid') episodeUuid: string,
    @Req() req: Request,
    @Body() updateStoryEpisodeDto: UpdateStoryEpisodeDto,
  ) {
    const user = req.user;
    const authorUuid = user['sub'];
    return this.storiesService.updateEpisode(
      episodeUuid,
      authorUuid,
      updateStoryEpisodeDto,
    );
  }
  @Patch(':contentUuid')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Student')
  updateStory(
    @Param('contentUuid') contentUuid: string,
    @Req() req: Request,
    @Body() updateStoryDto: UpdateStoryDto,
  ) {
    const user = req.user;
    const authorUuid = user['sub'];
    return this.storiesService.updateStory(
      contentUuid,
      authorUuid,
      updateStoryDto,
    );
  }

  @Delete('episodes/:episodeUuid')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Student')
  deleteEpisode(
    @Param('episodeUuid') episodeUuid: string,
    @Req() req: Request,
  ) {
    const user = req.user;
    const authorUuid = user['sub'];
    return this.storiesService.deleteEpisode(episodeUuid, authorUuid);
  }

  @Delete(':storyUuid')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Student')
  deleteStory(@Param('storyUuid') storyUuid: string, @Req() req: Request) {
    const user = req.user;
    const authorUuid = user['sub'];
    return this.storiesService.deleteStory(storyUuid, authorUuid);
  }
}
