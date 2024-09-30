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
import { AudioPodcastsService } from './audio-podcasts.service';
import { CreateAudioPodcastDto } from './dto/create-audio-podcast.dto';
import { UpdateAudioPodcastDto } from './dto/update-audio-podcast.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AudioPodcast } from './entities/audio-podcast.entity';

@ApiTags('Contents')
@Controller({ path: 'api/contents/audios', version: '1' })
export class AudioPodcastsController {
  constructor(private readonly audioPodcastsService: AudioPodcastsService) {}

  @Post()
  @ApiCreatedResponse({
    type: AudioPodcast,
  })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createAudioPodcastDto: CreateAudioPodcastDto) {
    return this.audioPodcastsService.create(createAudioPodcastDto);
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
  @ApiOkResponse({
    type: AudioPodcast,
  })
  @HttpCode(HttpStatus.OK)
  update(
    @Param('uuid') uuid: string,
    @Body() updateAudioPodcastDto: UpdateAudioPodcastDto,
  ) {
    return this.audioPodcastsService.update(uuid, updateAudioPodcastDto);
  }

  @Delete(':uuid')
  @ApiOkResponse({
    type: AudioPodcast,
  })
  @HttpCode(HttpStatus.OK)
  remove(@Param('uuid') uuid: string) {
    return this.audioPodcastsService.remove(uuid);
  }
}
