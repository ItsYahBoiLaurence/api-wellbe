import { Test, TestingModule } from '@nestjs/testing';
import { ParticipationRateService } from './participation-rate.service';

describe('ParticipationRateService', () => {
  let service: ParticipationRateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ParticipationRateService],
    }).compile();

    service = module.get<ParticipationRateService>(ParticipationRateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
