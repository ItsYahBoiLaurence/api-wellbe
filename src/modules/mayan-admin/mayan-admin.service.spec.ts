import { Test, TestingModule } from '@nestjs/testing';
import { MayanAdminService } from './mayan-admin.service';

describe('MayanAdminService', () => {
  let service: MayanAdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MayanAdminService],
    }).compile();

    service = module.get<MayanAdminService>(MayanAdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
