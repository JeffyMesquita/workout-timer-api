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
  PauseWorkoutSessionUseCase,
  ResumeWorkoutSessionUseCase,
  CompleteWorkoutSessionUseCase,
  PauseWorkoutSessionInput,
  ResumeWorkoutSessionInput,
  CompleteWorkoutSessionInput,
} from '../application/use-cases/control-workout-session.usecase';
import {
  StartWorkoutSessionUseCase,
  StartWorkoutSessionInput,
} from '../application/use-cases/start-workout-session.usecase';
import { JwtAuthGuard } from '../infrastructure/auth/jwt.guard';

// DTOs
export class StartWorkoutSessionDto {
  workoutPlanId!: string;
  notes?: string;
}

export class CompleteWorkoutSessionDto {
  notes?: string;
}

export class CancelWorkoutSessionDto {
  reason?: string;
}

@Controller('workout-sessions')
@UseGuards(JwtAuthGuard)
export class WorkoutSessionController {
  constructor(
    private readonly startWorkoutSessionUseCase: StartWorkoutSessionUseCase,
    private readonly pauseWorkoutSessionUseCase: PauseWorkoutSessionUseCase,
    private readonly resumeWorkoutSessionUseCase: ResumeWorkoutSessionUseCase,
    private readonly completeWorkoutSessionUseCase: CompleteWorkoutSessionUseCase,
  ) {}

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Erro desconhecido';
  }

  @Post()
  async startSession(@Req() req: any, @Body() dto: StartWorkoutSessionDto) {
    try {
      const input: StartWorkoutSessionInput = {
        userId: req.user.id,
        workoutPlanId: dto.workoutPlanId,
        notes: dto.notes,
      };

      const result = await this.startWorkoutSessionUseCase.execute(input);

      return {
        success: true,
        data: result,
        message: 'Sessão de treino iniciada com sucesso',
      };
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);

      if (errorMessage.includes('sessão ativa')) {
        throw new HttpException(
          {
            success: false,
            message: errorMessage,
            code: 'ACTIVE_SESSION_EXISTS',
          },
          HttpStatus.CONFLICT,
        );
      }

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

      if (errorMessage.includes('inativo')) {
        throw new HttpException(
          {
            success: false,
            message: errorMessage,
            code: 'WORKOUT_PLAN_INACTIVE',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (errorMessage.includes('sem exercícios')) {
        throw new HttpException(
          {
            success: false,
            message: errorMessage,
            code: 'NO_EXERCISES',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        {
          success: false,
          message: errorMessage || 'Erro ao iniciar sessão de treino',
          code: 'START_SESSION_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('active')
  async getActiveSession(@Req() req: any) {
    try {
      // TODO: Implementar GetActiveWorkoutSessionUseCase
      return {
        success: true,
        data: null,
        message: 'Sessão ativa obtida com sucesso',
      };
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);
      throw new HttpException(
        {
          success: false,
          message: errorMessage || 'Erro ao buscar sessão ativa',
          code: 'FETCH_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id/pause')
  async pauseSession(@Req() req: any, @Param('id') sessionId: string) {
    try {
      const input: PauseWorkoutSessionInput = {
        userId: req.user.id,
        sessionId,
      };

      const result = await this.pauseWorkoutSessionUseCase.execute(input);

      return {
        success: true,
        data: result,
        message: 'Sessão pausada com sucesso',
      };
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);

      if (errorMessage.includes('não encontrada')) {
        throw new HttpException(
          {
            success: false,
            message: errorMessage,
            code: 'SESSION_NOT_FOUND',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (errorMessage.includes('não é possível pausar')) {
        throw new HttpException(
          {
            success: false,
            message: errorMessage,
            code: 'CANNOT_PAUSE_SESSION',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        {
          success: false,
          message: errorMessage || 'Erro ao pausar sessão',
          code: 'PAUSE_SESSION_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id/resume')
  async resumeSession(@Req() req: any, @Param('id') sessionId: string) {
    try {
      const input: ResumeWorkoutSessionInput = {
        userId: req.user.id,
        sessionId,
      };

      const result = await this.resumeWorkoutSessionUseCase.execute(input);

      return {
        success: true,
        data: result,
        message: 'Sessão retomada com sucesso',
      };
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);

      if (errorMessage.includes('não encontrada')) {
        throw new HttpException(
          {
            success: false,
            message: errorMessage,
            code: 'SESSION_NOT_FOUND',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (errorMessage.includes('não é possível retomar')) {
        throw new HttpException(
          {
            success: false,
            message: errorMessage,
            code: 'CANNOT_RESUME_SESSION',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        {
          success: false,
          message: errorMessage || 'Erro ao retomar sessão',
          code: 'RESUME_SESSION_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id/complete')
  async completeSession(
    @Req() req: any,
    @Param('id') sessionId: string,
    @Body() dto: CompleteWorkoutSessionDto,
  ) {
    try {
      const input: CompleteWorkoutSessionInput = {
        userId: req.user.id,
        sessionId,
        notes: dto.notes,
      };

      const result = await this.completeWorkoutSessionUseCase.execute(input);

      return {
        success: true,
        data: result,
        message: 'Sessão finalizada com sucesso',
      };
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);

      if (errorMessage.includes('não encontrada')) {
        throw new HttpException(
          {
            success: false,
            message: errorMessage,
            code: 'SESSION_NOT_FOUND',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (errorMessage.includes('não é possível finalizar')) {
        throw new HttpException(
          {
            success: false,
            message: errorMessage,
            code: 'CANNOT_COMPLETE_SESSION',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        {
          success: false,
          message: errorMessage || 'Erro ao finalizar sessão',
          code: 'COMPLETE_SESSION_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async listSessions(
    @Req() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: string,
  ) {
    try {
      // TODO: Implementar ListWorkoutSessionsUseCase
      const statusArray = status ? status.split(',') : undefined;

      return {
        success: true,
        data: {
          sessions: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        },
        message: 'Histórico de sessões obtido com sucesso',
      };
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);
      throw new HttpException(
        {
          success: false,
          message: errorMessage || 'Erro ao buscar histórico de sessões',
          code: 'FETCH_SESSIONS_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getSession(@Req() req: any, @Param('id') sessionId: string) {
    try {
      // TODO: Implementar GetWorkoutSessionByIdUseCase
      return {
        success: true,
        data: null,
        message: 'Sessão obtida com sucesso',
      };
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);

      if (errorMessage.includes('não encontrada')) {
        throw new HttpException(
          {
            success: false,
            message: errorMessage,
            code: 'SESSION_NOT_FOUND',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      throw new HttpException(
        {
          success: false,
          message: errorMessage || 'Erro ao buscar sessão',
          code: 'FETCH_SESSION_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
