import { Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
    } catch (error) {
      // Allow the app to boot without a database (health checks, CI smoke tests,
      // local dev before Supabase env is wired up). Queries will surface errors.
      console.warn('[PrismaService] Database connection unavailable on startup:', error);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
