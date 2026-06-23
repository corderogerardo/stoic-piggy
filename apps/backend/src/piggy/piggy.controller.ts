import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { type CreateTransactionInput, createTransactionSchema } from '@stoicpiggy/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { PiggyService } from './piggy.service';

@Controller()
export class PiggyController {
  constructor(private readonly piggy: PiggyService) {}

  @Get('children/:childId/piggy-banks')
  listPiggyBanks(@Param('childId') childId: string) {
    return this.piggy.listPiggyBanks(childId);
  }

  @Post('transactions')
  createTransaction(
    @Body(new ZodValidationPipe(createTransactionSchema)) body: CreateTransactionInput,
  ) {
    return this.piggy.createTransaction(body);
  }
}
