import { Test, TestingModule } from '@nestjs/testing';
import { PklReportsService } from './pkl-reports.service';

describe('PklReportsService', () => {
  let service: PklReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PklReportsService],
    }).compile();

    service = module.get<PklReportsService>(PklReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
