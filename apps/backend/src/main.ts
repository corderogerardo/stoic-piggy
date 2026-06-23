import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { AppModule } from './app.module';
import { TrpcRouter } from './trpc/trpc.router';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();

  // Mount tRPC (typed API) at /trpc, alongside the REST routes under /api.
  const trpc = app.get(TrpcRouter);
  app.use(
    '/trpc',
    createExpressMiddleware({ router: trpc.appRouter, createContext: trpc.createContext }),
  );

  app.setGlobalPrefix('api');

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
  console.log(`🐷 Stoic Piggy API on http://localhost:${port}  (REST: /api · tRPC: /trpc)`);
}

void bootstrap();
