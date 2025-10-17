import { Test, TestingModule } from '@nestjs/testing';
import { PettycashService } from './pettycash.service';

describe('PettycashService', () => {
  let service: PettycashService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PettycashService],
    }).compile();

    service = module.get<PettycashService>(PettycashService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
