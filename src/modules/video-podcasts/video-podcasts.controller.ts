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

@ApiTags('Contents')
@Controller({ path: 'api/contents/videos', version: '1' })
export class VideoPodcastsController {
  constructor(private readonly videoPodcastsService: VideoPodcastsService) {}

  @Post()
  @ApiCreatedResponse({
    type: VideoPodcast,
  })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createVideoPodcastDto: CreateVideoPodcastDto) {
    return this.videoPodcastsService.create(createVideoPodcastDto);
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
  @ApiOkResponse({
    type: VideoPodcast,
  })
  @HttpCode(HttpStatus.OK)
  update(
    @Param('uuid') uuid: string,
    @Body() updateVideoPodcastDto: UpdateVideoPodcastDto,
  ) {
    return this.videoPodcastsService.update(uuid, updateVideoPodcastDto);
  }

  @Delete(':uuid')
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully deleted.',
  })
  @HttpCode(HttpStatus.OK)
  remove(@Param('uuid') uuid: string) {
    return this.videoPodcastsService.remove(uuid);
  }
}
