import { Test, TestingModule } from '@nestjs/testing';
import { VideoPodcastsController } from './video-podcasts.controller';
import { VideoPodcastsService } from './video-podcasts.service';

describe('VideoPodcastsController', () => {
  let controller: VideoPodcastsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VideoPodcastsController],
      providers: [VideoPodcastsService],
    }).compile();

    controller = module.get<VideoPodcastsController>(VideoPodcastsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
