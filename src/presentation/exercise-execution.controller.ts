import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Req,
  UseGuards,
  HttpStatus,
  HttpException,
} from '@nestjs/common';

import {
  CompleteSetUseCase,
  CompleteSetInput,
} from '../application/use-cases/complete-set.usecase';
import {
  FinishExerciseExecutionUseCase,
  FinishExerciseExecutionInput,
} from '../application/use-cases/finish-exercise-execution.usecase';
import {
  StartExerciseExecutionUseCase,
  StartExerciseExecutionInput,
} from '../application/use-cases/start-exercise-execution.usecase';
import { JwtAuthGuard } from '../infrastructure/auth/jwt.guard';

// DTOs
export class StartExerciseExecutionDto {
  workoutSessionId!: string;
  exerciseId!: string;
  startingWeight?: number;
}

export class CompleteSetDto {
  setNumber!: number;
  actualReps!: number;
  weight?: number;
  restTimeSeconds?: number;
  notes?: string;
}

export class FinishExerciseExecutionDto {
  notes?: string;
  forceComplete?: boolean;
}

@Controller('exercise-executions')
@UseGuards(JwtAuthGuard)
export class ExerciseExecutionController {
  constructor(
    private readonly startExerciseExecutionUseCase: StartExerciseExecutionUseCase,
    private readonly completeSetUseCase: CompleteSetUseCase,
    private readonly finishExerciseExecutionUseCase: FinishExerciseExecutionUseCase,
  ) {}

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Erro desconhecido';
  }

  @Post()
  async startExercise(@Req() req: any, @Body() dto: StartExerciseExecutionDto) {
    try {
      const input: StartExerciseExecutionInput = {
        userId: req.user.id,
        workoutSessionId: dto.workoutSessionId,
        exerciseId: dto.exerciseId,
        startingWeight: dto.startingWeight,
      };

      const result = await this.startExerciseExecutionUseCase.execute(input);

      return {
        success: true,
        data: result,
        message: 'Execução de exercício iniciada com sucesso',
      };
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);

      if (errorMessage.includes('não encontrada') || errorMessage.includes('não encontrado')) {
        throw new HttpException(
          {
            success: false,
            message: errorMessage,
            code: 'NOT_FOUND',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (errorMessage.includes('inativa') || errorMessage.includes('já foi iniciado')) {
        throw new HttpException(
          {
            success: false,
            message: errorMessage,
            code: 'INVALID_STATE',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        {
          success: false,
          message: errorMessage || 'Erro ao iniciar execução do exercício',
          code: 'START_EXERCISE_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id/sets/:setNumber/complete')
  async completeSet(
    @Req() req: any,
    @Param('id') exerciseExecutionId: string,
    @Param('setNumber') setNumber: string,
    @Body() dto: CompleteSetDto,
  ) {
    try {
      const input: CompleteSetInput = {
        userId: req.user.id,
        exerciseExecutionId,
        setNumber: parseInt(setNumber),
        actualReps: dto.actualReps,
        weight: dto.weight,
        restTimeSeconds: dto.restTimeSeconds,
        notes: dto.notes,
      };

      const result = await this.completeSetUseCase.execute(input);

      return {
        success: true,
        data: result,
        message: `Série ${setNumber} completada com sucesso`,
      };
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);

      if (errorMessage.includes('não encontrada') || errorMessage.includes('não encontrado')) {
        throw new HttpException(
          {
            success: false,
            message: errorMessage,
            code: 'NOT_FOUND',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (errorMessage.includes('já foi completada') || errorMessage.includes('inativa')) {
        throw new HttpException(
          {
            success: false,
            message: errorMessage,
            code: 'INVALID_STATE',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        {
          success: false,
          message: errorMessage || 'Erro ao completar série',
          code: 'COMPLETE_SET_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id/finish')
  async finishExercise(
    @Req() req: any,
    @Param('id') exerciseExecutionId: string,
    @Body() dto: FinishExerciseExecutionDto,
  ) {
    try {
      const input: FinishExerciseExecutionInput = {
        userId: req.user.id,
        exerciseExecutionId,
        notes: dto.notes,
        forceComplete: dto.forceComplete,
      };

      const result = await this.finishExerciseExecutionUseCase.execute(input);

      return {
        success: true,
        data: result,
        message: 'Execução do exercício finalizada com sucesso',
      };
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);

      if (errorMessage.includes('não encontrada') || errorMessage.includes('não encontrado')) {
        throw new HttpException(
          {
            success: false,
            message: errorMessage,
            code: 'NOT_FOUND',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (errorMessage.includes('não está ativa')) {
        throw new HttpException(
          {
            success: false,
            message: errorMessage,
            code: 'EXECUTION_NOT_ACTIVE',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (errorMessage.includes('nem todas as séries')) {
        throw new HttpException(
          {
            success: false,
            message: errorMessage,
            code: 'INCOMPLETE_SETS',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        {
          success: false,
          message: errorMessage || 'Erro ao finalizar execução do exercício',
          code: 'FINISH_EXERCISE_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getExerciseExecution(@Req() req: any, @Param('id') exerciseExecutionId: string) {
    try {
      // TODO: Implementar GetExerciseExecutionByIdUseCase
      return {
        success: true,
        data: null,
        message: 'Execução do exercício obtida com sucesso',
      };
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);

      if (errorMessage.includes('não encontrada')) {
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
          message: errorMessage || 'Erro ao buscar execução do exercício',
          code: 'FETCH_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/sets')
  async getSets(@Req() req: any, @Param('id') exerciseExecutionId: string) {
    try {
      // TODO: Implementar GetSetsByExecutionUseCase
      return {
        success: true,
        data: {
          sets: [],
          executionInfo: {
            totalSets: 0,
            completedSets: 0,
            canComplete: false,
          },
        },
        message: 'Séries obtidas com sucesso',
      };
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);
      throw new HttpException(
        {
          success: false,
          message: errorMessage || 'Erro ao buscar séries',
          code: 'FETCH_SETS_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('exercise/:exerciseId/history')
  async getExerciseHistory(
    @Req() req: any,
    @Param('exerciseId') exerciseId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    try {
      // TODO: Implementar GetExerciseHistoryUseCase
      return {
        success: true,
        data: {
          executions: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
          stats: {
            totalExecutions: 0,
            averageReps: 0,
            maxWeight: null,
            progression: [],
          },
        },
        message: 'Histórico do exercício obtido com sucesso',
      };
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);
      throw new HttpException(
        {
          success: false,
          message: errorMessage || 'Erro ao buscar histórico do exercício',
          code: 'FETCH_HISTORY_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id/sets/:setNumber/weight')
  async updateSetWeight(
    @Req() req: any,
    @Param('id') exerciseExecutionId: string,
    @Param('setNumber') setNumber: string,
    @Body() body: { weight: number },
  ) {
    try {
      // TODO: Implementar UpdateSetWeightUseCase
      return {
        success: true,
        data: {
          setNumber: parseInt(setNumber),
          weight: body.weight,
          updatedAt: new Date(),
        },
        message: 'Peso da série atualizado com sucesso',
      };
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);
      throw new HttpException(
        {
          success: false,
          message: errorMessage || 'Erro ao atualizar peso da série',
          code: 'UPDATE_WEIGHT_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
