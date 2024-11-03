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

@Controller('stories')
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Student')
  createStory(@Body() createStoryDto: CreateStoryDto) {
    return this.storiesService.create(createStoryDto);
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

  @Get(':storyUuid')
  getStoryWithEpisodes(@Param('storyUuid') storyUuid: string) {
    return this.storiesService.getStoryWithEpisodes(storyUuid);
  }

  @Get('episodes/:storyUuid')
  getOneEpisode(
    @Param('storyUuid') storyUuid: string,
    @Body() episodeUuid: string,
  ) {
    return this.storiesService.getOneEpisode(storyUuid, episodeUuid);
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

  @Delete(':episodeUuid')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Student')
  deleteStory(@Param('episodeUuid') episodeUuid: string, @Req() req: Request) {
    const user = req.user;
    const authorUuid = user['sub'];
    return this.storiesService.deleteStory(episodeUuid, authorUuid);
  }
}
