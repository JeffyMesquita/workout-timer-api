import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma.service';
import { PrismaWorkoutPlanRepository } from '../prisma-workout-plan.repository';
import { WorkoutPlan } from '../../../../domain/entities/workout-plan.entity';
import { Exercise } from '../../../../domain/entities/exercise.entity';

describe('PrismaWorkoutPlanRepository (Integration)', () => {
  let repository: PrismaWorkoutPlanRepository;
  let prisma: PrismaService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [PrismaService, PrismaWorkoutPlanRepository],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
    repository = module.get<PrismaWorkoutPlanRepository>(
      PrismaWorkoutPlanRepository,
    );

    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await module.close();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await prisma.set.deleteMany();
    await prisma.exerciseExecution.deleteMany();
    await prisma.workoutSession.deleteMany();
    await prisma.exercise.deleteMany();
    await prisma.workoutPlan.deleteMany();
    await prisma.user.deleteMany();

    // Create test user
    await prisma.user.create({
      data: {
        id: 'test-user-1',
        email: 'test@example.com',
        googleId: 'google-123',
      },
    });
  });

  describe('save and findById', () => {
    it('should save and retrieve a workout plan', async () => {
      const workoutPlan = new WorkoutPlan(
        'plan-1',
        'test-user-1',
        'Treino A',
        'Treino de peito',
        true,
        new Date('2023-01-01'),
        new Date('2023-01-01'),
        [],
      );

      const savedPlan = await repository.save(workoutPlan);
      const retrievedPlan = await repository.findById('plan-1');

      expect(savedPlan.id).toBe('plan-1');
      expect(savedPlan.name).toBe('Treino A');
      expect(retrievedPlan).toBeDefined();
      expect(retrievedPlan!.id).toBe('plan-1');
      expect(retrievedPlan!.name).toBe('Treino A');
    });

    it('should save workout plan with exercises', async () => {
      // First, create the workout plan in the database
      const workoutPlan = new WorkoutPlan(
        'plan-1',
        'test-user-1',
        'Treino A',
        'Treino de peito',
        true,
        new Date('2023-01-01'),
        new Date('2023-01-01'),
        [],
      );

      await repository.save(workoutPlan);

      // Then add exercises directly to the database
      await prisma.exercise.create({
        data: {
          id: 'exercise-1',
          workoutPlanId: 'plan-1',
          name: 'Supino reto',
          description: 'Exercício para peitoral',
          targetMuscleGroup: 'Peito',
          sets: 3,
          reps: 10,
          restTimeSeconds: 60,
          order: 1,
        },
      });

      const retrievedPlan = await repository.findById('plan-1');

      expect(retrievedPlan).toBeDefined();
      expect(retrievedPlan!.exercises).toHaveLength(1);
      expect(retrievedPlan!.exercises[0].name).toBe('Supino reto');
      expect(retrievedPlan!.exercises[0].order).toBe(1);
    });
  });

  describe('findByUserId', () => {
    beforeEach(async () => {
      // Create test plans
      await prisma.workoutPlan.createMany({
        data: [
          {
            id: 'plan-1',
            userId: 'test-user-1',
            name: 'Treino A',
            description: 'Treino de peito',
            isActive: true,
          },
          {
            id: 'plan-2',
            userId: 'test-user-1',
            name: 'Treino B',
            description: 'Treino de costas',
            isActive: false,
          },
        ],
      });
    });

    it('should return all plans for user', async () => {
      const plans = await repository.findByUserId('test-user-1');

      expect(plans).toHaveLength(2);
      expect(plans.map((p) => p.name)).toContain('Treino A');
      expect(plans.map((p) => p.name)).toContain('Treino B');
    });

    it('should return only active plans', async () => {
      const activePlans = await repository.findActiveByUserId('test-user-1');

      expect(activePlans).toHaveLength(1);
      expect(activePlans[0].name).toBe('Treino A');
      expect(activePlans[0].isActive).toBe(true);
    });
  });

  describe('count methods', () => {
    beforeEach(async () => {
      await prisma.workoutPlan.createMany({
        data: [
          {
            id: 'plan-1',
            userId: 'test-user-1',
            name: 'Treino A',
            isActive: true,
          },
          {
            id: 'plan-2',
            userId: 'test-user-1',
            name: 'Treino B',
            isActive: false,
          },
          {
            id: 'plan-3',
            userId: 'test-user-1',
            name: 'Treino C',
            isActive: true,
          },
        ],
      });
    });

    it('should count all plans for user', async () => {
      const count = await repository.countByUserId('test-user-1');
      expect(count).toBe(3);
    });

    it('should count only active plans for user', async () => {
      const count = await repository.countActiveByUserId('test-user-1');
      expect(count).toBe(2);
    });
  });

  describe('existsByUserIdAndName', () => {
    beforeEach(async () => {
      await prisma.workoutPlan.create({
        data: {
          id: 'plan-1',
          userId: 'test-user-1',
          name: 'Treino A',
          isActive: true,
        },
      });
    });

    it('should return true for existing name', async () => {
      const exists = await repository.existsByUserIdAndName(
        'test-user-1',
        'Treino A',
      );
      expect(exists).toBe(true);
    });

    it('should return false for non-existing name', async () => {
      const exists = await repository.existsByUserIdAndName(
        'test-user-1',
        'Treino B',
      );
      expect(exists).toBe(false);
    });

    it('should be case insensitive', async () => {
      const exists = await repository.existsByUserIdAndName(
        'test-user-1',
        'treino a',
      );
      expect(exists).toBe(true);
    });

    it('should exclude specific ID when provided', async () => {
      const exists = await repository.existsByUserIdAndName(
        'test-user-1',
        'Treino A',
        'plan-1',
      );
      expect(exists).toBe(false);
    });
  });

  describe('update workflow', () => {
    it('should update existing workout plan', async () => {
      // Create initial plan
      const workoutPlan = new WorkoutPlan(
        'plan-1',
        'test-user-1',
        'Treino A',
        'Descrição original',
        true,
      );

      await repository.save(workoutPlan);

      // Update plan
      workoutPlan.update('Treino A Atualizado', 'Nova descrição');
      const updatedPlan = await repository.save(workoutPlan);

      expect(updatedPlan.name).toBe('Treino A Atualizado');
      expect(updatedPlan.description).toBe('Nova descrição');

      // Verify in database
      const retrievedPlan = await repository.findById('plan-1');
      expect(retrievedPlan!.name).toBe('Treino A Atualizado');
      expect(retrievedPlan!.description).toBe('Nova descrição');
    });
  });

  describe('delete', () => {
    it('should delete workout plan', async () => {
      const workoutPlan = new WorkoutPlan(
        'plan-1',
        'test-user-1',
        'Treino A',
        null,
        true,
      );

      await repository.save(workoutPlan);

      // Verify it exists
      let retrievedPlan = await repository.findById('plan-1');
      expect(retrievedPlan).toBeDefined();

      // Delete it
      await repository.delete('plan-1');

      // Verify it's gone
      retrievedPlan = await repository.findById('plan-1');
      expect(retrievedPlan).toBeNull();
    });
  });

  describe('pagination', () => {
    beforeEach(async () => {
      // Create 5 test plans
      const plans = Array.from({ length: 5 }, (_, i) => ({
        id: `plan-${i + 1}`,
        userId: 'test-user-1',
        name: `Treino ${String.fromCharCode(65 + i)}`, // A, B, C, D, E
        isActive: i < 3, // First 3 are active
      }));

      await prisma.workoutPlan.createMany({ data: plans });
    });

    it('should paginate results correctly', async () => {
      const result = await repository.findByUserIdWithPagination(
        'test-user-1',
        1,
        2,
        true, // include inactive
      );

      expect(result.plans).toHaveLength(2);
      expect(result.total).toBe(5);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(2);
      expect(result.totalPages).toBe(3);
    });

    it('should filter inactive plans when requested', async () => {
      const result = await repository.findByUserIdWithPagination(
        'test-user-1',
        1,
        10,
        false, // exclude inactive
      );

      expect(result.plans).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(result.plans.every((p) => p.isActive)).toBe(true);
    });
  });

  describe('search by name', () => {
    beforeEach(async () => {
      await prisma.workoutPlan.createMany({
        data: [
          {
            id: 'plan-1',
            userId: 'test-user-1',
            name: 'Treino Peito',
            isActive: true,
          },
          {
            id: 'plan-2',
            userId: 'test-user-1',
            name: 'Treino Costas',
            isActive: true,
          },
          {
            id: 'plan-3',
            userId: 'test-user-1',
            name: 'Treino Pernas',
            isActive: false,
          },
        ],
      });
    });

    it('should search by partial name match', async () => {
      const results = await repository.searchByName('test-user-1', 'Treino');

      expect(results).toHaveLength(2); // Only active plans
      expect(results.map((p) => p.name)).toContain('Treino Peito');
      expect(results.map((p) => p.name)).toContain('Treino Costas');
    });

    it('should be case insensitive', async () => {
      const results = await repository.searchByName('test-user-1', 'peito');

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Treino Peito');
    });

    it('should return empty array for no matches', async () => {
      const results = await repository.searchByName(
        'test-user-1',
        'NonExistent',
      );

      expect(results).toHaveLength(0);
    });
  });
});
