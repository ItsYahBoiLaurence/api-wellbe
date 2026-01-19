import { Test, TestingModule } from '@nestjs/testing';
import { ResendMailerService } from './resend-mailer.service';

describe('ResendMailerService', () => {
  let service: ResendMailerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResendMailerService],
    }).compile();

    service = module.get<ResendMailerService>(ResendMailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
