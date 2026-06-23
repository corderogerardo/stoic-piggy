import { Module } from '@nestjs/common';
import { PiggyController } from './piggy.controller';
import { PiggyService } from './piggy.service';

@Module({
  controllers: [PiggyController],
  providers: [PiggyService],
  exports: [PiggyService],
})
export class PiggyModule {}
