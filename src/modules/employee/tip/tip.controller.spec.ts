import { Test, TestingModule } from '@nestjs/testing';
import { TipController } from './tip.controller';

describe('TipController', () => {
  let controller: TipController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TipController],
    }).compile();

    controller = module.get<TipController>(TipController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
