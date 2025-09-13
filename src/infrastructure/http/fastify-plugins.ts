import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';

import type { FastifyInstance, FastifyRequest } from 'fastify';

interface RateLimitContext {
  ttl: number;
}

export async function registerFastifyPlugins(app: FastifyInstance) {
  try {
    // Registrar CORS
    await app.register(cors, {
      origin: true,
      credentials: true,
    });

    // Registrar Helmet para segurança
    await app.register(helmet, {
      contentSecurityPolicy: false, // Desabilitar CSP para desenvolvimento
    });

    // Registrar Rate Limiting
    await app.register(rateLimit, {
      max: 300,
      timeWindow: '1 minute',
      errorResponseBuilder: function (request: FastifyRequest, context: RateLimitContext) {
        return {
          code: 429,
          error: 'Too Many Requests',
          message: `Rate limit exceeded, retry in ${Math.round(context.ttl / 1000)} seconds.`,
        };
      },
    });

    // eslint-disable-next-line no-console
    console.log('✅ Fastify plugins registered successfully');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Error registering Fastify plugins:', error);
    throw error;
  }
}
