import { Injectable } from '@nestjs/common';

import jwt, { SignOptions } from 'jsonwebtoken';

@Injectable()
export class JwtServiceLocal {
  private readonly jwtSecret: string;
  private readonly jwtRefreshSecret: string;
  private readonly jwtExpiresIn: string;
  private readonly jwtRefreshExpiresIn: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET as string;
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET as string;
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '15m';
    this.jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

    if (!this.jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }
    if (!this.jwtRefreshSecret) {
      throw new Error('JWT_REFRESH_SECRET is not defined');
    }
  }

  signAccess(payload: any) {
    const options: SignOptions = { expiresIn: this.jwtExpiresIn as any };
    return jwt.sign(payload, this.jwtSecret, options);
  }
  signRefresh(payload: any) {
    const options: SignOptions = { expiresIn: this.jwtRefreshExpiresIn as any };
    return jwt.sign(payload, this.jwtRefreshSecret, options);
  }
  verifyAccess(token: string) {
    return jwt.verify(token, this.jwtSecret);
  }
  verifyRefresh(token: string) {
    return jwt.verify(token, this.jwtRefreshSecret);
  }
}
