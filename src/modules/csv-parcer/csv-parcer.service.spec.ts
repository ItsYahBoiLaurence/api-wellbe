import { Test, TestingModule } from '@nestjs/testing';
import { CsvParcerService } from './csv-parcer.service';

describe('CsvParcerService', () => {
  let service: CsvParcerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CsvParcerService],
    }).compile();

    service = module.get<CsvParcerService>(CsvParcerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
