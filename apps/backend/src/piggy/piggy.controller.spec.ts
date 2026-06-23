import { Test } from '@nestjs/testing';
import { PiggyController } from './piggy.controller';
import { PiggyService } from './piggy.service';

describe('PiggyController', () => {
  let controller: PiggyController;
  const piggyService = {
    listPiggyBanks: jest.fn().mockResolvedValue([]),
    createTransaction: jest.fn().mockResolvedValue({ id: 't1' }),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PiggyController],
      providers: [{ provide: PiggyService, useValue: piggyService }],
    }).compile();
    controller = moduleRef.get(PiggyController);
  });

  it('lists piggy banks for a child', async () => {
    await expect(controller.listPiggyBanks('child-1')).resolves.toEqual([]);
    expect(piggyService.listPiggyBanks).toHaveBeenCalledWith('child-1');
  });
});
