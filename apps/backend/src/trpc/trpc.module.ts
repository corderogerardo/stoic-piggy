import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { FamilyModule } from '../family/family.module';
import { PiggyModule } from '../piggy/piggy.module';
import { TaskModule } from '../task/task.module';
import { TrpcRouter } from './trpc.router';

@Module({
  imports: [PiggyModule, FamilyModule, AuthModule, TaskModule],
  providers: [TrpcRouter],
  exports: [TrpcRouter],
})
export class TrpcModule {}
