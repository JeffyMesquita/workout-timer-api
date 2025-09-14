import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

import { AppleIdTokenVerifier } from '../infrastructure/auth/apple.strategy';
import { GoogleIdTokenVerifier } from '../infrastructure/auth/google.strategy';
import { JwtServiceLocal } from '../infrastructure/auth/jwt.service';
import { PrismaService } from '../infrastructure/database/prisma.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly googleVerifier: GoogleIdTokenVerifier,
    private readonly appleVerifier: AppleIdTokenVerifier,
    private readonly jwt: JwtServiceLocal,
  ) {}

  @Post('google')
  @ApiOperation({
    summary: 'Login com Google OAuth',
    description: 'Autentica usuário usando ID Token do Google e retorna JWT tokens',
  })
  @ApiBody({
    description: 'ID Token do Google OAuth',
    schema: {
      type: 'object',
      properties: {
        idToken: {
          type: 'string',
          description: 'ID Token obtido do Google Sign-In',
          example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
      required: ['idToken'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', description: 'JWT Access Token' },
        refreshToken: { type: 'string', description: 'JWT Refresh Token' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  async google(@Body() body: { idToken: string }) {
    const { email, sub } = await this.googleVerifier.verify(body.idToken);
    const user = await this.prisma.user.upsert({
      where: { email },
      update: { googleId: sub },
      create: { email, googleId: sub },
    });
    const accessToken = this.jwt.signAccess({ id: user.id, email: user.email });
    const refreshToken = this.jwt.signRefresh({ id: user.id });
    return { accessToken, refreshToken, user: { id: user.id, email: user.email } };
  }

  @Post('apple')
  @ApiOperation({
    summary: 'Login com Apple Sign In',
    description: 'Autentica usuário usando ID Token da Apple e retorna JWT tokens',
  })
  @ApiBody({
    description: 'ID Token da Apple Sign In',
    schema: {
      type: 'object',
      properties: {
        idToken: {
          type: 'string',
          description: 'ID Token obtido do Apple Sign In',
          example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
      required: ['idToken'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', description: 'JWT Access Token' },
        refreshToken: { type: 'string', description: 'JWT Refresh Token' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  async apple(@Body() body: { idToken: string }) {
    const { email, sub } = await this.appleVerifier.verify(body.idToken);
    const user = await this.prisma.user.upsert({
      where: { email },
      update: { appleSub: sub },
      create: { email, appleSub: sub },
    });
    const accessToken = this.jwt.signAccess({ id: user.id, email: user.email });
    const refreshToken = this.jwt.signRefresh({ id: user.id });
    return { accessToken, refreshToken, user: { id: user.id, email: user.email } };
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Renovar Access Token',
    description: 'Usa refresh token para obter um novo access token',
  })
  @ApiBody({
    description: 'Refresh Token para renovação',
    schema: {
      type: 'object',
      properties: {
        refreshToken: {
          type: 'string',
          description: 'JWT Refresh Token válido',
          example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
      required: ['refreshToken'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Token renovado com sucesso',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', description: 'Novo JWT Access Token' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Refresh token inválido ou expirado' })
  async refresh(@Body() body: { refreshToken: string }) {
    const payload: any = this.jwt.verifyRefresh(body.refreshToken);
    const user = await this.prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) throw new Error('User not found');
    const accessToken = this.jwt.signAccess({ id: user.id, email: user.email });
    return { accessToken };
  }
}
