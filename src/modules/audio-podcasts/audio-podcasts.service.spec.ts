import { Test, TestingModule } from '@nestjs/testing';
import { AudioPodcastsService } from './audio-podcasts.service';

describe('AudioPodcastsService', () => {
  let service: AudioPodcastsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AudioPodcastsService],
    }).compile();

    service = module.get<AudioPodcastsService>(AudioPodcastsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
