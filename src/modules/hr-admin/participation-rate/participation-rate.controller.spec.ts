import { Test, TestingModule } from '@nestjs/testing';
import { ParticipationRateController } from './participation-rate.controller';

describe('ParticipationRateController', () => {
  let controller: ParticipationRateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParticipationRateController],
    }).compile();

    controller = module.get<ParticipationRateController>(ParticipationRateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
