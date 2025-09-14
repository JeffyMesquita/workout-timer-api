import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { registerFastifyPlugins } from './infrastructure/http/fastify-plugins';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new FastifyAdapter({ logger: true }));
  await registerFastifyPlugins(app.getHttpAdapter().getInstance());

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('🏋️‍♂️ Workout Timer API')
    .setDescription(
      'API completa para aplicativo de cronômetro de treino com registro de pesos e progressão',
    )
    .setVersion('1.0.0')
    .addTag('auth', 'Autenticação Google/Apple')
    .addTag('subscriptions', 'Sistema de assinaturas premium')
    .addTag('workout-plans', 'Gestão de planos de treino')
    .addTag('workout-sessions', 'Execução de treinos')
    .addTag('exercise-executions', 'Execução de exercícios e séries')
    .addTag('health', 'Health checks')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addServer('http://localhost:3000', 'Desenvolvimento')
    .addServer('https://api.workout-timer.com', 'Produção')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showRequestHeaders: true,
      showCommonExtensions: true,
    },
    customSiteTitle: 'Workout Timer API Documentation',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: `
      .swagger-ui .topbar { background-color: #1f2937; }
      .swagger-ui .topbar .download-url-wrapper { display: none; }
      .swagger-ui .info .title { color: #10b981; }
    `,
  });

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api`);
}
bootstrap();
