import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';

import { AppModule } from './app.module';
import { registerFastifyPlugins } from './infrastructure/http/fastify-plugins';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new FastifyAdapter({ logger: true }));
  await registerFastifyPlugins(app.getHttpAdapter().getInstance());
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000, '0.0.0.0');
}
bootstrap();
