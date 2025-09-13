import { FastifyInstance } from 'fastify';

export async function registerFastifyPlugins(app: FastifyInstance) {
  try {
    // Registrar CORS
    await app.register(require('@fastify/cors'), {
      origin: true,
      credentials: true,
    });

    // Registrar Helmet para segurança
    await app.register(require('@fastify/helmet'), {
      contentSecurityPolicy: false, // Desabilitar CSP para desenvolvimento
    });

    // Registrar Rate Limiting
    await app.register(require('@fastify/rate-limit'), {
      max: 300,
      timeWindow: '1 minute',
      errorResponseBuilder: function (request: any, context: any) {
        return {
          code: 429,
          error: 'Too Many Requests',
          message: `Rate limit exceeded, retry in ${Math.round(
            context.ttl / 1000,
          )} seconds.`,
        };
      },
    });

    console.log('✅ Fastify plugins registered successfully');
  } catch (error) {
    console.error('❌ Error registering Fastify plugins:', error);
    throw error;
  }
}
