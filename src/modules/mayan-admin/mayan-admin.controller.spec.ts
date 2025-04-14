import { Test, TestingModule } from '@nestjs/testing';
import { MayanAdminController } from './mayan-admin.controller';

describe('MayanAdminController', () => {
  let controller: MayanAdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MayanAdminController],
    }).compile();

    controller = module.get<MayanAdminController>(MayanAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
