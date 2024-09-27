import { Test, TestingModule } from '@nestjs/testing';
import { VideoPodcastsService } from './video-podcasts.service';

describe('VideoPodcastsService', () => {
  let service: VideoPodcastsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VideoPodcastsService],
    }).compile();

    service = module.get<VideoPodcastsService>(VideoPodcastsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
