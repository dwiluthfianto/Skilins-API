import { Test, TestingModule } from '@nestjs/testing';
import { PklReportsController } from './pkl-reports.controller';
import { PklReportsService } from './pkl-reports.service';

describe('PklReportsController', () => {
  let controller: PklReportsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PklReportsController],
      providers: [PklReportsService],
    }).compile();

    controller = module.get<PklReportsController>(PklReportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
