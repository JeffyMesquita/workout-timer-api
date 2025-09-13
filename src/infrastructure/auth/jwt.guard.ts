import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers['authorization'];
    if (!auth) return false;
    const token = String(auth).replace('Bearer ', '');
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET as string);
      return true;
    } catch {
      return false;
    }
  }
}
