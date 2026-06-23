import { Test, type TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();
    controller = moduleRef.get(AppController);
  });

  it('returns the app name and status', () => {
    expect(controller.getInfo()).toEqual({ name: 'Stoic Piggy', status: 'ok' });
  });
});
