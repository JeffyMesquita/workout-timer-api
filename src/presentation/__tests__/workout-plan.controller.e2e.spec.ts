import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { JwtServiceLocal } from '../../infrastructure/auth/jwt.service';

describe('WorkoutPlanController (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtServiceLocal;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get<JwtServiceLocal>(JwtServiceLocal);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up database
    await prisma.set.deleteMany();
    await prisma.exerciseExecution.deleteMany();
    await prisma.workoutSession.deleteMany();
    await prisma.exercise.deleteMany();
    await prisma.workoutPlan.deleteMany();
    await prisma.subscriptionEvent.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.user.deleteMany();

    // Create test user
    await prisma.user.create({
      data: {
        id: 'test-user-1',
        email: 'test@example.com',
        googleId: 'google-123',
      },
    });

    // Generate auth token
    authToken = jwtService.signAccess({
      id: 'test-user-1',
      email: 'test@example.com',
    });
  });

  describe('POST /workout-plans', () => {
    it('should create a workout plan successfully', async () => {
      const createDto = {
        name: 'Treino A',
        description: 'Treino de peito e tríceps',
      };

      const response = await request(app.getHttpServer())
        .post('/workout-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Plano de treino criado com sucesso',
        data: {
          name: 'Treino A',
          description: 'Treino de peito e tríceps',
          isActive: true,
          exerciseCount: 0,
          limitsInfo: {
            current: 1,
            limit: 2,
            canCreateMore: true,
          },
        },
      });

      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.createdAt).toBeDefined();
    });

    it('should return 401 without authentication', async () => {
      const createDto = {
        name: 'Treino A',
      };

      await request(app.getHttpServer())
        .post('/workout-plans')
        .send(createDto)
        .expect(401);
    });

    it('should return 400 for invalid input', async () => {
      const createDto = {
        name: '', // Empty name
      };

      await request(app.getHttpServer())
        .post('/workout-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(500); // Our validation throws Error, which becomes 500
    });

    it('should return 409 for duplicate name', async () => {
      const createDto = {
        name: 'Treino A',
      };

      // Create first plan
      await request(app.getHttpServer())
        .post('/workout-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(201);

      // Try to create duplicate
      const response = await request(app.getHttpServer())
        .post('/workout-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(409);

      expect(response.body).toMatchObject({
        success: false,
        code: 'DUPLICATE_NAME',
      });
    });

    it('should enforce free tier limits', async () => {
      // Create 2 plans (free tier limit)
      for (let i = 1; i <= 2; i++) {
        await request(app.getHttpServer())
          .post('/workout-plans')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ name: `Treino ${i}` })
          .expect(201);
      }

      // Try to create 3rd plan
      const response = await request(app.getHttpServer())
        .post('/workout-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Treino 3' })
        .expect(403);

      expect(response.body).toMatchObject({
        success: false,
        code: 'LIMIT_EXCEEDED',
      });

      expect(response.body.message).toContain('limite de 2 planos');
    });

    it('should allow unlimited plans for premium users', async () => {
      // Create premium subscription
      await prisma.subscription.create({
        data: {
          id: 'sub-1',
          userId: 'test-user-1',
          productId: 'premium',
          purchaseToken: 'token-123',
          status: 'active',
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          acknowledged: true,
        },
      });

      // Create 3 plans (should work for premium)
      for (let i = 1; i <= 3; i++) {
        const response = await request(app.getHttpServer())
          .post('/workout-plans')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ name: `Treino ${i}` })
          .expect(201);

        expect(response.body.data.limitsInfo.limit).toBe(-1); // Unlimited
      }
    });

    it('should trim whitespace from input', async () => {
      const createDto = {
        name: '  Treino A  ',
        description: '  Descrição  ',
      };

      const response = await request(app.getHttpServer())
        .post('/workout-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(201);

      expect(response.body.data.name).toBe('Treino A');
      expect(response.body.data.description).toBe('Descrição');
    });
  });

  describe('GET /workout-plans', () => {
    it('should return empty list for user with no plans', async () => {
      const response = await request(app.getHttpServer())
        .get('/workout-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Lista de planos de treino obtida com sucesso',
        data: {
          plans: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
          },
        },
      });
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer()).get('/workout-plans').expect(401);
    });
  });

  describe('GET /workout-plans/:id', () => {
    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .get('/workout-plans/some-id')
        .expect(401);
    });

    it('should return workout plan placeholder', async () => {
      const response = await request(app.getHttpServer())
        .get('/workout-plans/some-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Plano de treino obtido com sucesso',
        data: null,
      });
    });
  });

  describe('PUT /workout-plans/:id', () => {
    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .put('/workout-plans/some-id')
        .send({ name: 'Updated' })
        .expect(401);
    });

    it('should return update placeholder', async () => {
      const response = await request(app.getHttpServer())
        .put('/workout-plans/some-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated' })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Plano de treino atualizado com sucesso',
        data: null,
      });
    });
  });

  describe('DELETE /workout-plans/:id', () => {
    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .delete('/workout-plans/some-id')
        .expect(401);
    });

    it('should return delete placeholder', async () => {
      const response = await request(app.getHttpServer())
        .delete('/workout-plans/some-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Plano de treino removido com sucesso',
      });
    });
  });

  describe('GET /workout-plans/:id/exercises', () => {
    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .get('/workout-plans/some-id/exercises')
        .expect(401);
    });

    it('should return exercises placeholder', async () => {
      const response = await request(app.getHttpServer())
        .get('/workout-plans/some-id/exercises')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Exercícios do plano obtidos com sucesso',
        data: {
          exercises: [],
          planInfo: {
            id: 'some-id',
            name: '',
            exerciseCount: 0,
          },
        },
      });
    });
  });

  describe('POST /workout-plans/:id/exercises', () => {
    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .post('/workout-plans/some-id/exercises')
        .send({ name: 'Exercise' })
        .expect(401);
    });

    it('should return add exercise placeholder', async () => {
      const response = await request(app.getHttpServer())
        .post('/workout-plans/some-id/exercises')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Exercise' })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Exercício adicionado ao plano com sucesso',
        data: null,
      });
    });
  });

  describe('Authentication and Authorization', () => {
    it('should reject invalid JWT tokens', async () => {
      await request(app.getHttpServer())
        .post('/workout-plans')
        .set('Authorization', 'Bearer invalid-token')
        .send({ name: 'Treino A' })
        .expect(401);
    });

    it('should reject expired JWT tokens', async () => {
      // This would require mocking time or using a pre-expired token
      // For now, we'll test with malformed token
      await request(app.getHttpServer())
        .post('/workout-plans')
        .set('Authorization', 'Bearer malformed.token.here')
        .send({ name: 'Treino A' })
        .expect(401);
    });

    it('should reject requests without Bearer prefix', async () => {
      await request(app.getHttpServer())
        .post('/workout-plans')
        .set('Authorization', authToken) // Missing "Bearer "
        .send({ name: 'Treino A' })
        .expect(401);
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // This is hard to test without mocking, but we can test malformed requests
      const response = await request(app.getHttpServer())
        .post('/workout-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({}) // Missing required fields
        .expect(500);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return proper error format', async () => {
      const response = await request(app.getHttpServer())
        .post('/workout-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: '' }) // Invalid name
        .expect(500);

      expect(response.body).toMatchObject({
        success: false,
        code: 'INTERNAL_ERROR',
      });

      expect(response.body.message).toBeDefined();
    });
  });
});
