import { Test, TestingModule } from '@nestjs/testing';
import { WellbeingService } from './wellbeing.service';

describe('WellbeingService', () => {
  let service: WellbeingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WellbeingService],
    }).compile();

    service = module.get<WellbeingService>(WellbeingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
