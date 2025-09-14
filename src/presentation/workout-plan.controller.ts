import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Req,
  UseGuards,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

import {
  AddExerciseToWorkoutPlanUseCase,
  AddExerciseToWorkoutPlanInput,
} from '../application/use-cases/add-exercise-to-workout-plan.usecase';
import {
  CreateWorkoutPlanUseCase,
  CreateWorkoutPlanInput,
} from '../application/use-cases/create-workout-plan.usecase';
import {
  DeleteWorkoutPlanUseCase,
  DeleteWorkoutPlanInput,
} from '../application/use-cases/delete-workout-plan.usecase';
import {
  GetWorkoutPlanByIdUseCase,
  GetWorkoutPlanByIdInput,
} from '../application/use-cases/get-workout-plan-by-id.usecase';
import {
  ListExercisesByPlanUseCase,
  ListExercisesByPlanInput,
} from '../application/use-cases/list-exercises-by-plan.usecase';
import {
  ListWorkoutPlansUseCase,
  ListWorkoutPlansInput,
} from '../application/use-cases/list-workout-plans.usecase';
import {
  UpdateWorkoutPlanUseCase,
  UpdateWorkoutPlanInput,
} from '../application/use-cases/update-workout-plan.usecase';
import { WorkoutLimitExceededException } from '../domain/services/workout-limit.service';
import { JwtAuthGuard } from '../infrastructure/auth/jwt.guard';

// DTOs
export class CreateWorkoutPlanDto {
  name!: string;
  description?: string;
}

export class UpdateWorkoutPlanDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export class WorkoutPlanQueryDto {
  page?: number = 1;
  limit?: number = 10;
  search?: string;
  includeInactive?: boolean = false;
}

export class AddExerciseDto {
  name!: string;
  description?: string;
  targetMuscleGroup?: string;
  sets?: number = 3;
  reps?: number = 10;
  restTimeSeconds?: number = 60;
}

@ApiTags('workout-plans')
@ApiBearerAuth('JWT-auth')
@Controller('workout-plans')
@UseGuards(JwtAuthGuard)
export class WorkoutPlanController {
  constructor(
    private readonly createWorkoutPlanUseCase: CreateWorkoutPlanUseCase,
    private readonly listWorkoutPlansUseCase: ListWorkoutPlansUseCase,
    private readonly getWorkoutPlanByIdUseCase: GetWorkoutPlanByIdUseCase,
    private readonly updateWorkoutPlanUseCase: UpdateWorkoutPlanUseCase,
    private readonly deleteWorkoutPlanUseCase: DeleteWorkoutPlanUseCase,
    private readonly addExerciseToWorkoutPlanUseCase: AddExerciseToWorkoutPlanUseCase,
    private readonly listExercisesByPlanUseCase: ListExercisesByPlanUseCase,
  ) {}

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Erro desconhecido';
  }

  @Post()
  @ApiOperation({
    summary: 'Criar plano de treino',
    description: 'Cria um novo plano de treino para o usuário autenticado',
  })
  @ApiBody({
    description: 'Dados do plano de treino',
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Nome do plano de treino',
          example: 'Treino A - Peito e Tríceps',
          minLength: 1,
          maxLength: 100,
        },
        description: {
          type: 'string',
          description: 'Descrição opcional do plano',
          example: 'Foco em exercícios de peito e tríceps',
          maxLength: 500,
        },
      },
      required: ['name'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Plano de treino criado com sucesso',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Limite de planos excedido (free tier)' })
  async create(@Req() req: any, @Body() dto: CreateWorkoutPlanDto) {
    try {
      const input: CreateWorkoutPlanInput = {
        userId: req.user.id,
        name: dto.name,
        description: dto.description,
      };

      const result = await this.createWorkoutPlanUseCase.execute(input);

      return {
        success: true,
        data: result,
        message: 'Plano de treino criado com sucesso',
      };
    } catch (error) {
      if (error instanceof WorkoutLimitExceededException) {
        throw new HttpException(
          {
            success: false,
            message: error.message,
            code: 'LIMIT_EXCEEDED',
            details: error.validationResult,
          },
          HttpStatus.FORBIDDEN,
        );
      }

      const errorMessage = this.getErrorMessage(error);

      if (errorMessage.includes('já existe')) {
        throw new HttpException(
          {
            success: false,
            message: errorMessage,
            code: 'DUPLICATE_NAME',
          },
          HttpStatus.CONFLICT,
        );
      }

      throw new HttpException(
        {
          success: false,
          message: errorMessage || 'Erro interno do servidor',
          code: 'INTERNAL_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async list(@Req() req: any, @Query() query: WorkoutPlanQueryDto) {
    try {
      const input: ListWorkoutPlansInput = {
        userId: req.user.id,
        page: query.page || 1,
        limit: query.limit || 10,
        search: query.search,
        includeInactive: query.includeInactive || false,
      };

      const result = await this.listWorkoutPlansUseCase.execute(input);

      return {
        success: true,
        data: result,
        message: 'Lista de planos de treino obtida com sucesso',
      };
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);
      throw new HttpException(
        {
          success: false,
          message: errorMessage || 'Erro ao buscar planos de treino',
          code: 'FETCH_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getById(@Req() req: any, @Param('id') id: string) {
    try {
      const input: GetWorkoutPlanByIdInput = {
        userId: req.user.id,
        planId: id,
      };

      const result = await this.getWorkoutPlanByIdUseCase.execute(input);

      return {
        success: true,
        data: result,
        message: 'Plano de treino obtido com sucesso',
      };
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);

      if (errorMessage.includes('não encontrado')) {
        throw new HttpException(
          {
            success: false,
            message: errorMessage,
            code: 'NOT_FOUND',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      throw new HttpException(
        {
          success: false,
          message: errorMessage || 'Erro ao buscar plano de treino',
          code: 'FETCH_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateWorkoutPlanDto) {
    try {
      const input: UpdateWorkoutPlanInput = {
        userId: req.user.id,
        planId: id,
        name: dto.name,
        description: dto.description,
        isActive: dto.isActive,
      };

      const result = await this.updateWorkoutPlanUseCase.execute(input);

      return {
        success: true,
        data: result,
        message: 'Plano de treino atualizado com sucesso',
      };
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);

      if (errorMessage.includes('não encontrado')) {
        throw new HttpException(
          {
            success: false,
            message: errorMessage,
            code: 'NOT_FOUND',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (errorMessage.includes('já existe')) {
        throw new HttpException(
          {
            success: false,
            message: errorMessage,
            code: 'DUPLICATE_NAME',
          },
          HttpStatus.CONFLICT,
        );
      }

      throw new HttpException(
        {
          success: false,
          message: errorMessage || 'Erro ao atualizar plano de treino',
          code: 'UPDATE_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async delete(@Req() req: any, @Param('id') id: string, @Query('force') force?: string) {
    try {
      const input: DeleteWorkoutPlanInput = {
        userId: req.user.id,
        planId: id,
        force: force === 'true',
      };

      const result = await this.deleteWorkoutPlanUseCase.execute(input);

      return {
        success: true,
        data: result,
        message: result.message,
      };
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);

      if (errorMessage.includes('não encontrado')) {
        throw new HttpException(
          {
            success: false,
            message: errorMessage,
            code: 'NOT_FOUND',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (errorMessage.includes('exercícios') || errorMessage.includes('em uso')) {
        throw new HttpException(
          {
            success: false,
            message: errorMessage,
            code: 'PLAN_IN_USE',
          },
          HttpStatus.CONFLICT,
        );
      }

      throw new HttpException(
        {
          success: false,
          message: errorMessage || 'Erro ao remover plano de treino',
          code: 'DELETE_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/exercises')
  async listExercises(@Req() req: any, @Param('id') planId: string) {
    try {
      const input: ListExercisesByPlanInput = {
        userId: req.user.id,
        workoutPlanId: planId,
      };

      const result = await this.listExercisesByPlanUseCase.execute(input);

      return {
        success: true,
        data: result,
        message: 'Exercícios do plano obtidos com sucesso',
      };
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);

      if (errorMessage.includes('não encontrado')) {
        throw new HttpException(
          {
            success: false,
            message: errorMessage,
            code: 'WORKOUT_PLAN_NOT_FOUND',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      throw new HttpException(
        {
          success: false,
          message: errorMessage || 'Erro ao buscar exercícios do plano',
          code: 'FETCH_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/exercises')
  async addExercise(
    @Req() req: any,
    @Param('id') planId: string,
    @Body() exerciseDto: AddExerciseDto,
  ) {
    try {
      const input: AddExerciseToWorkoutPlanInput = {
        userId: req.user.id,
        workoutPlanId: planId,
        name: exerciseDto.name,
        description: exerciseDto.description,
        targetMuscleGroup: exerciseDto.targetMuscleGroup,
        sets: exerciseDto.sets,
        reps: exerciseDto.reps,
        restTimeSeconds: exerciseDto.restTimeSeconds,
      };

      const result = await this.addExerciseToWorkoutPlanUseCase.execute(input);

      return {
        success: true,
        data: result,
        message: 'Exercício adicionado ao plano com sucesso',
      };
    } catch (error) {
      if (error instanceof WorkoutLimitExceededException) {
        throw new HttpException(
          {
            success: false,
            message: error.message,
            code: 'EXERCISE_LIMIT_EXCEEDED',
            details: error.validationResult,
          },
          HttpStatus.FORBIDDEN,
        );
      }

      const errorMessage = this.getErrorMessage(error);

      if (errorMessage.includes('não encontrado')) {
        throw new HttpException(
          {
            success: false,
            message: errorMessage,
            code: 'WORKOUT_PLAN_NOT_FOUND',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (errorMessage.includes('já existe')) {
        throw new HttpException(
          {
            success: false,
            message: errorMessage,
            code: 'DUPLICATE_EXERCISE_NAME',
          },
          HttpStatus.CONFLICT,
        );
      }

      if (errorMessage.includes('inativo')) {
        throw new HttpException(
          {
            success: false,
            message: errorMessage,
            code: 'INACTIVE_WORKOUT_PLAN',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        {
          success: false,
          message: errorMessage || 'Erro ao adicionar exercício',
          code: 'ADD_EXERCISE_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
