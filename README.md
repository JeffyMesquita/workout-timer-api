# Nest Premium Boilerplate (Hexagonal) — Google/Apple Login + Prisma + JWT/Refresh

**Stack**: NestJS + Fastify + Prisma + PostgreSQL + Jest (TDD)  
**Auth**: Google OAuth (ID Token) pronto; Apple Sign In preparado  
**Premium**: Stubs para Google Play Billing (ver `infrastructure/google-play/*`)

## Setup rápido
1) Copie `.env.example` para `.env` e preencha variáveis.  
2) `npm i`  
3) `npx prisma generate && npx prisma migrate dev`  
4) `npm run dev`

## Fluxos de autenticação
- `POST /auth/google` — recebe `idToken` do Google (obtido no app) e retorna `{ accessToken, refreshToken, user }`
- `POST /auth/apple` — recebe `idToken` da Apple (app iOS) e retorna `{ accessToken, refreshToken, user }`
- `POST /auth/refresh` — recebe `refreshToken` e retorna novo `accessToken`

> **Nota**: o verificador da Apple aqui está como *stub*; em produção valide a assinatura via JWKS da Apple e `aud/iss`.

## Assinaturas (Google Play)
- `POST /subscriptions/activate` — body: `{ productId, purchaseToken }`
- `POST /subscriptions/restore` — sem body
- `GET /subscriptions/status`

**Casos de uso** em `src/application/use-cases/*` com dependências injetadas por interfaces (hexagonal).

## Onde plugar o Apple Sign In de verdade?
Substitua `infrastructure/auth/apple.strategy.ts` por um verificador que:
- Baixe o JWKS da Apple (https://appleid.apple.com/auth/keys)
- Resolva o `kid` do header do JWT
- Verifique assinatura e `aud` (seu `APPLE_CLIENT_ID`) e `iss`

## Boas práticas (SOLID/Clean/Hexagonal)
- Controllers só orquestram; regras ficam nos casos de uso.
- Casos de uso dependem de **interfaces** (`ports`/`repositories`), nunca de Prisma direto.
- Repositórios concretos e serviços externos (Google Play) ficam em `infrastructure/*`.
- Entidades e interfaces do **domínio** não importam nada de Nest.

Bom proveito! 🚀
