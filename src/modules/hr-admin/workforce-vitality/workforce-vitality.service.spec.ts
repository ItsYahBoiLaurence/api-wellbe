import { Test, TestingModule } from '@nestjs/testing';
import { WorkforceVitalityService } from './workforce-vitality.service';

describe('WorkforceVitalityService', () => {
  let service: WorkforceVitalityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkforceVitalityService],
    }).compile();

    service = module.get<WorkforceVitalityService>(WorkforceVitalityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
