import { Injectable } from '@nestjs/common';
import { FamilyService } from '../family/family.service';
import { PiggyService } from '../piggy/piggy.service';
import { type AppRouter, createAppRouter } from './app.router';
import { createTrpcContext } from './trpc.context';

@Injectable()
export class TrpcRouter {
  readonly appRouter: AppRouter;
  readonly createContext = createTrpcContext;

  constructor(piggy: PiggyService, family: FamilyService) {
    this.appRouter = createAppRouter({ piggy, family });
  }
}
