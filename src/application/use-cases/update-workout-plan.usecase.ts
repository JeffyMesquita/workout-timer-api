import { Inject, Injectable } from '@nestjs/common';
import { WorkoutPlanRepository } from '../../domain/repositories/workout-plan.repository';

export interface UpdateWorkoutPlanInput {
  userId: string;
  planId: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateWorkoutPlanOutput {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  exerciseCount: number;
  updatedAt: Date;
}

@Injectable()
export class UpdateWorkoutPlanUseCase {
  constructor(
    @Inject('WorkoutPlanRepository')
    private readonly workoutPlanRepository: WorkoutPlanRepository,
  ) {}

  async execute(
    input: UpdateWorkoutPlanInput,
  ): Promise<UpdateWorkoutPlanOutput> {
    const { userId, planId, name, description, isActive } = input;

    // Validar entrada
    this.validateInput(input);

    // Buscar o plano de treino
    const workoutPlan = await this.workoutPlanRepository.findByIdAndUserId(
      planId,
      userId,
    );

    if (!workoutPlan) {
      throw new Error('Plano de treino não encontrado');
    }

    // Verificar se o novo nome já existe (se foi fornecido)
    if (name && name.trim() !== workoutPlan.name) {
      const nameExists = await this.workoutPlanRepository.existsByUserIdAndName(
        userId,
        name.trim(),
        planId, // Excluir o próprio plano da verificação
      );

      if (nameExists) {
        throw new Error(`Já existe um plano de treino com o nome "${name}"`);
      }
    }

    // Atualizar propriedades se fornecidas
    if (name !== undefined) {
      workoutPlan.name = name.trim();
    }

    if (description !== undefined) {
      workoutPlan.description = description?.trim() || null;
    }

    if (isActive !== undefined) {
      if (isActive) {
        workoutPlan.activate();
      } else {
        workoutPlan.deactivate();
      }
    }

    // Atualizar timestamp
    workoutPlan.updatedAt = new Date();

    // Salvar alterações
    const updatedPlan = await this.workoutPlanRepository.save(workoutPlan);

    return {
      id: updatedPlan.id,
      name: updatedPlan.name,
      description: updatedPlan.description,
      isActive: updatedPlan.isActive,
      exerciseCount: updatedPlan.exercises.length,
      updatedAt: updatedPlan.updatedAt,
    };
  }

  private validateInput(input: UpdateWorkoutPlanInput): void {
    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error('User ID é obrigatório');
    }

    if (!input.planId || input.planId.trim().length === 0) {
      throw new Error('Plan ID é obrigatório');
    }

    // Verificar se pelo menos um campo foi fornecido para atualização
    if (
      input.name === undefined &&
      input.description === undefined &&
      input.isActive === undefined
    ) {
      throw new Error(
        'Pelo menos um campo deve ser fornecido para atualização',
      );
    }

    // Validar nome se fornecido
    if (input.name !== undefined) {
      if (input.name.trim().length === 0) {
        throw new Error('Nome não pode estar vazio');
      }

      if (input.name.trim().length > 100) {
        throw new Error('Nome deve ter no máximo 100 caracteres');
      }

      const namePattern = /^[a-zA-ZÀ-ÿ0-9\s\-_()]+$/;
      if (!namePattern.test(input.name.trim())) {
        throw new Error(
          'Nome pode conter apenas letras, números, espaços, hífens, sublinhados e parênteses',
        );
      }
    }

    // Validar descrição se fornecida
    if (input.description !== undefined && input.description !== null) {
      if (input.description.length > 500) {
        throw new Error('Descrição deve ter no máximo 500 caracteres');
      }
    }
  }
}

/**
 * Exceção específica para atualização de plano de treino
 */
export class UpdateWorkoutPlanException extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: any,
  ) {
    super(message);
    this.name = 'UpdateWorkoutPlanException';
  }
}
