import { Test, TestingModule } from '@nestjs/testing';
import { AudioPodcastsController } from './audio-podcasts.controller';
import { AudioPodcastsService } from './audio-podcasts.service';

describe('AudioPodcastsController', () => {
  let controller: AudioPodcastsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AudioPodcastsController],
      providers: [AudioPodcastsService],
    }).compile();

    controller = module.get<AudioPodcastsController>(AudioPodcastsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
