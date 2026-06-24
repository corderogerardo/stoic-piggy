import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { FamilyService } from '../family/family.service';
import { PiggyService } from '../piggy/piggy.service';
import { TaskService } from '../task/task.service';
import { type AppRouter, createAppRouter } from './app.router';
import { makeCreateContext } from './trpc.context';

@Injectable()
export class TrpcRouter {
  readonly appRouter: AppRouter;
  readonly createContext: ReturnType<typeof makeCreateContext>;

  constructor(piggy: PiggyService, family: FamilyService, auth: AuthService, task: TaskService) {
    this.appRouter = createAppRouter({ piggy, family, auth, task });
    this.createContext = makeCreateContext((token) => auth.verify(token));
  }
}
