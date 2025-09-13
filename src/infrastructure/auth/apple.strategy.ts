import { Injectable } from '@nestjs/common';

import jwt from 'jsonwebtoken';

/**
 * Verificador simples para Sign in with Apple (id_token enviado do app iOS).
 * Em produção: buscar JWKS da Apple e validar assinatura (kid) + audience + issuer.
 */
@Injectable()
export class AppleIdTokenVerifier {
  async verify(idToken: string) {
    // TODO: buscar JWKS da Apple e validar. Aqui apenas decodifica sem verificar assinatura.
    const decoded = jwt.decode(idToken) as any;
    if (!decoded || !decoded.email) throw new Error('Invalid Apple token');
    return { email: decoded.email, sub: decoded.sub };
  }
}
