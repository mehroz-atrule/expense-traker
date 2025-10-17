import { Test, TestingModule } from '@nestjs/testing';
import { PettycashController } from './pettycash.controller';
import { PettycashService } from './pettycash.service';

describe('PettycashController', () => {
  let controller: PettycashController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PettycashController],
      providers: [PettycashService],
    }).compile();

    controller = module.get<PettycashController>(PettycashController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
