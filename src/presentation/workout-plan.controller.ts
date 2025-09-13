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
import { JwtAuthGuard } from '../infrastructure/auth/jwt.guard';
import {
  CreateWorkoutPlanUseCase,
  CreateWorkoutPlanInput,
} from '../application/use-cases/create-workout-plan.usecase';
import { WorkoutLimitExceededException } from '../domain/services/workout-limit.service';

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

@Controller('workout-plans')
@UseGuards(JwtAuthGuard)
export class WorkoutPlanController {
  constructor(
    private readonly createWorkoutPlanUseCase: CreateWorkoutPlanUseCase,
  ) // Outros use cases serão injetados aqui conforme implementarmos
  {}

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Erro desconhecido';
  }

  @Post()
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
      // TODO: Implementar ListWorkoutPlansUseCase
      return {
        success: true,
        data: {
          plans: [],
          pagination: {
            page: query.page,
            limit: query.limit,
            total: 0,
            totalPages: 0,
          },
        },
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
      // TODO: Implementar GetWorkoutPlanByIdUseCase
      return {
        success: true,
        data: null,
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
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateWorkoutPlanDto,
  ) {
    try {
      // TODO: Implementar UpdateWorkoutPlanUseCase
      return {
        success: true,
        data: null,
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
  async delete(@Req() req: any, @Param('id') id: string) {
    try {
      // TODO: Implementar DeleteWorkoutPlanUseCase
      return {
        success: true,
        message: 'Plano de treino removido com sucesso',
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

      if (errorMessage.includes('em uso')) {
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
      // TODO: Implementar ListExercisesByPlanUseCase
      return {
        success: true,
        data: {
          exercises: [],
          planInfo: {
            id: planId,
            name: '',
            exerciseCount: 0,
          },
        },
        message: 'Exercícios do plano obtidos com sucesso',
      };
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);
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
    @Body() exerciseDto: any,
  ) {
    try {
      // TODO: Implementar AddExerciseToPlanUseCase
      return {
        success: true,
        data: null,
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
