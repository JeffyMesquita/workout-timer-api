import { Body, Controller, Post } from '@nestjs/common';
import { PrismaService } from '../infrastructure/database/prisma.service';
import { GoogleIdTokenVerifier } from '../infrastructure/auth/google.strategy';
import { AppleIdTokenVerifier } from '../infrastructure/auth/apple.strategy';
import { JwtServiceLocal } from '../infrastructure/auth/jwt.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly googleVerifier: GoogleIdTokenVerifier,
    private readonly appleVerifier: AppleIdTokenVerifier,
    private readonly jwt: JwtServiceLocal,
  ) {}

  @Post('google')
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
  async refresh(@Body() body: { refreshToken: string }) {
    const payload: any = this.jwt.verifyRefresh(body.refreshToken);
    const user = await this.prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) throw new Error('User not found');
    const accessToken = this.jwt.signAccess({ id: user.id, email: user.email });
    return { accessToken };
  }
}
