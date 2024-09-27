import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AudioPodcastsService } from './audio-podcasts.service';
import { CreateAudioPodcastDto } from './dto/create-audio-podcast.dto';
import { UpdateAudioPodcastDto } from './dto/update-audio-podcast.dto';

@Controller('audio-podcasts')
export class AudioPodcastsController {
  constructor(private readonly audioPodcastsService: AudioPodcastsService) {}

  @Post()
  create(@Body() createAudioPodcastDto: CreateAudioPodcastDto) {
    return this.audioPodcastsService.create(createAudioPodcastDto);
  }

  @Get()
  findAll() {
    return this.audioPodcastsService.findAll();
  }

  @Get(':uuid')
  findOne(@Param('uuid') uuid: string) {
    return this.audioPodcastsService.findOne(uuid);
  }

  @Patch(':uuid')
  update(
    @Param('uuid') uuid: string,
    @Body() updateAudioPodcastDto: UpdateAudioPodcastDto,
  ) {
    return this.audioPodcastsService.update(uuid, updateAudioPodcastDto);
  }

  @Delete(':uuid')
  remove(@Param('uuid') uuid: string) {
    return this.audioPodcastsService.remove(uuid);
  }
}
