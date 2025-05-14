import { Test, TestingModule } from '@nestjs/testing';
import { WorkforceVitalityController } from './workforce-vitality.controller';

describe('WorkforceVitalityController', () => {
  let controller: WorkforceVitalityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkforceVitalityController],
    }).compile();

    controller = module.get<WorkforceVitalityController>(WorkforceVitalityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
