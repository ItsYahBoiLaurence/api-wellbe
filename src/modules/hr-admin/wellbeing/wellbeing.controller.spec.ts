import { Test, TestingModule } from '@nestjs/testing';
import { WellbeingController } from './wellbeing.controller';

describe('WellbeingController', () => {
  let controller: WellbeingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WellbeingController],
    }).compile();

    controller = module.get<WellbeingController>(WellbeingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
