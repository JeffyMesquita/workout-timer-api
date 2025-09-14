# 🏋️‍♂️ Workout Timer API

[![CI/CD](https://github.com/JeffyMesquita/workout-timer-api/actions/workflows/ci.yml/badge.svg)](https://github.com/JeffyMesquita/workout-timer-api/actions/workflows/ci.yml)
[![Code Quality](https://github.com/JeffyMesquita/workout-timer-api/actions/workflows/code-quality.yml/badge.svg)](https://github.com/JeffyMesquita/workout-timer-api/actions/workflows/code-quality.yml)
[![Security](https://github.com/JeffyMesquita/workout-timer-api/actions/workflows/security.yml/badge.svg)](https://github.com/JeffyMesquita/workout-timer-api/actions/workflows/security.yml)
[![Tests](https://img.shields.io/badge/tests-188%20passing-brightgreen)](https://github.com/JeffyMesquita/workout-timer-api)
[![Coverage](https://img.shields.io/badge/coverage-95%25-brightgreen)](https://github.com/JeffyMesquita/workout-timer-api)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)](https://github.com/JeffyMesquita/workout-timer-api)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)](https://github.com/JeffyMesquita/workout-timer-api)

> **API completa para aplicativo de cronômetro de treino com registro de pesos e
> progressão**  
> Desenvolvida com **Clean Architecture**, **SOLID principles** e **TDD** para
> máxima qualidade e manutenibilidade.

## 🎯 **Visão Geral**

Esta API foi desenvolvida para suportar um aplicativo mobile de cronômetro de
treino com **diferencial único**: **registro detalhado de pesos por série**. O
sistema permite criar planos de treino específicos (A, B, C, D), executar
treinos com timer automático, registrar pesos e repetições reais, e acompanhar
progressão ao longo do tempo.

### ✨ **Principais Diferenciais**

- 🏋️‍♂️ **Registro de pesos por série** - Diferencial competitivo
- ⏱️ **Timer automático** com pausar/retomar
- 📊 **Histórico completo** de treinos e progressão
- 🎯 **Planos específicos** (A, B, C, D) com limites free/premium
- 📱 **Autenticação social** (Google + Apple)
- 💳 **Sistema de assinaturas** integrado ao Google Play
- 🔒 **Arquitetura robusta** com Clean Architecture + SOLID

## 🚀 **Stack Tecnológica**

### **Backend**

- **Framework:** [NestJS](https://nestjs.com/) +
  [Fastify](https://www.fastify.io/)
- **Database:** [PostgreSQL](https://www.postgresql.org/) +
  [Prisma ORM](https://www.prisma.io/)
- **Auth:** [JWT](https://jwt.io/) +
  [Google OAuth](https://developers.google.com/identity) +
  [Apple Sign In](https://developer.apple.com/sign-in-with-apple/)
- **Testing:** [Jest](https://jestjs.io/) (Unit + Integration + E2E)
- **Containerization:** [Docker](https://www.docker.com/) +
  [Docker Compose](https://docs.docker.com/compose/)

### **DevOps & Quality**

- **CI/CD:** [GitHub Actions](https://github.com/features/actions)
- **Linting:** [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/)
- **Security:** [Snyk](https://snyk.io/) + [CodeQL](https://codeql.github.com/)
- **Documentation:** [Swagger/OpenAPI](https://swagger.io/)

## 📱 **Funcionalidades Implementadas**

### 🔐 **Autenticação (100%)**

- ✅ **Google OAuth** - Login com ID Token
- ✅ **Apple Sign In** - Login com ID Token
- ✅ **JWT Tokens** - Access + Refresh tokens
- ✅ **Middleware de autenticação** automático

### 💳 **Sistema de Assinaturas (100%)**

- ✅ **Google Play Store** integrado
- ✅ **Ativação de compras** premium
- ✅ **Restauração de assinaturas**
- ✅ **Validação de limites** free vs premium

### 📋 **Planos de Treino (100%)**

- ✅ **CRUD completo** (Criar, Listar, Ver, Atualizar, Deletar)
- ✅ **Validação de limites** (2 planos free, ilimitado premium)
- ✅ **Nomes únicos** por usuário
- ✅ **Busca e paginação**

### 💪 **Exercícios (100%)**

- ✅ **Gestão completa** de exercícios
- ✅ **Configuração detalhada** (séries, reps, descanso)
- ✅ **Validação de limites** (5 exercícios free, ilimitado premium)
- ✅ **Ordenação personalizada**

### ⏱️ **Execução de Treinos (100%)**

- ✅ **Controle completo** de sessões
- ✅ **Pausar/retomar** funcionalidade
- ✅ **Uma sessão ativa** por vez
- ✅ **Cálculo automático** de duração

### ⚖️ **Registro de Pesos (DIFERENCIAL) ⭐**

- ✅ **Peso por série** individual
- ✅ **Repetições reais** vs planejadas
- ✅ **Tempo de descanso** registrado
- ✅ **Notas por série** personalizadas
- ✅ **Sugestões de peso** baseadas no histórico
- ✅ **Progressão de peso** ao longo do tempo

### 📊 **Histórico e Estatísticas (100%)**

- ✅ **Todas as sessões** são salvas
- ✅ **Dados detalhados** de cada série
- ✅ **Estatísticas de performance**
- ✅ **Consulta posterior** completa

## 🏗️ **Arquitetura**

### **Clean Architecture + Hexagonal Architecture**

```
src/
├── domain/                 # Regras de negócio puras
│   ├── entities/          # Entidades do domínio
│   ├── repositories/      # Interfaces dos repositórios
│   └── services/          # Serviços de domínio
├── application/           # Casos de uso
│   └── use-cases/        # Lógica de aplicação
├── infrastructure/        # Implementações concretas
│   ├── database/         # Prisma + Repositórios
│   ├── auth/            # JWT + OAuth
│   └── http/            # Fastify + Controllers
└── presentation/         # Controllers REST
    └── *.controller.ts   # Endpoints da API
```

### **Princípios SOLID Aplicados**

- **S** - Single Responsibility: Cada classe tem uma responsabilidade
- **O** - Open/Closed: Aberto para extensão, fechado para modificação
- **L** - Liskov Substitution: Interfaces bem definidas
- **I** - Interface Segregation: Interfaces específicas
- **D** - Dependency Inversion: Dependências injetadas

## 🚀 **Como Executar**

### **Pré-requisitos**

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) (recomendado) ou npm
- [Docker](https://www.docker.com/) + Docker Compose
- [PostgreSQL](https://www.postgresql.org/) (ou use Docker)

### **1. Clone o repositório**

```bash
git clone https://github.com/JeffyMesquita/workout-timer-api.git
cd workout-timer-api
```

### **2. Configure as variáveis de ambiente**

```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

### **3. Execute com Docker (Recomendado)**

```bash
# Subir todos os serviços
docker-compose up -d

# Verificar logs
docker-compose logs -f api
```

### **4. Ou execute localmente**

```bash
# Instalar dependências
pnpm install

# Gerar cliente Prisma
pnpm prisma:generate

# Executar migrações
pnpm prisma:migrate:dev

# Iniciar em desenvolvimento
pnpm run start:dev
```

### **5. Acessar a API**

- **API:** http://localhost:3000
- **Swagger:** http://localhost:3000/api
- **Health Check:** http://localhost:3000/health

## 📚 **Documentação da API**

### **Swagger UI**

Acesse http://localhost:3000/api para documentação interativa completa.

### **Insomnia Collection**

Importe o arquivo `insomnia-workspace.json` no Insomnia para testar todas as
rotas:

1. Abra o Insomnia
2. Create → Import from → File
3. Selecione `insomnia-workspace.json`
4. Pronto! Todas as rotas organizadas por pastas

### **Endpoints Principais**

#### **🔐 Autenticação**

```http
POST /auth/google          # Login com Google
POST /auth/apple           # Login com Apple
POST /auth/refresh         # Renovar token
```

#### **💳 Assinaturas**

```http
POST /subscriptions/activate    # Ativar premium
POST /subscriptions/restore     # Restaurar compra
GET  /subscriptions/status      # Status da assinatura
```

#### **📋 Planos de Treino**

```http
POST   /workout-plans           # Criar plano
GET    /workout-plans           # Listar planos
GET    /workout-plans/:id       # Ver plano
PUT    /workout-plans/:id       # Atualizar plano
DELETE /workout-plans/:id       # Deletar plano
```

#### **💪 Exercícios**

```http
POST /workout-plans/:id/exercises    # Adicionar exercício
GET  /workout-plans/:id/exercises    # Listar exercícios
```

#### **⏱️ Sessões de Treino**

```http
POST /workout-sessions                    # Iniciar treino
POST /workout-sessions/:id/pause          # Pausar treino
POST /workout-sessions/:id/resume         # Retomar treino
POST /workout-sessions/:id/complete       # Finalizar treino
POST /workout-sessions/:id/cancel         # Cancelar treino
```

#### **🏋️‍♂️ Execução de Exercícios**

```http
POST /exercise-executions                           # Iniciar exercício
POST /exercise-executions/:id/sets                  # Completar série
PUT  /exercise-executions/:id/sets/:setId/weight    # Atualizar peso
POST /exercise-executions/:id/finish                # Finalizar exercício
GET  /exercise-executions/exercise/:id/history      # Histórico
```

## 📱 **Integração com App Mobile**

### **Fluxo de Autenticação**

```typescript
// 1. Login com Google (Android/iOS)
const googleUser = await GoogleSignin.signIn();
const idToken = googleUser.idToken;

// 2. Enviar para API
const response = await fetch('http://localhost:3000/auth/google', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ idToken }),
});

const { accessToken, refreshToken, user } = await response.json();

// 3. Salvar tokens para uso posterior
await AsyncStorage.setItem('accessToken', accessToken);
await AsyncStorage.setItem('refreshToken', refreshToken);
```

### **Fluxo de Treino**

```typescript
// 1. Criar plano de treino
const workoutPlan = await createWorkoutPlan({
  name: 'Plano A - Peito e Tríceps',
  description: 'Treino focado em peito e tríceps',
});

// 2. Adicionar exercícios
await addExercise(workoutPlan.id, {
  name: 'Supino Reto',
  sets: 3,
  reps: 12,
  restTime: 60,
});

// 3. Iniciar sessão de treino
const session = await startWorkoutSession(workoutPlan.id);

// 4. Executar exercício
const execution = await startExerciseExecution(session.id, exercise.id);

// 5. Completar série com peso
await completeSet(execution.id, {
  weight: 80.5,
  reps: 12,
  restTime: 60,
  notes: 'Série executada com boa forma',
});
```

### **Headers Necessários**

```typescript
const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${accessToken}`,
};
```

## 🧪 **Testes**

### **Executar Testes**

```bash
# Todos os testes
pnpm test

# Testes unitários
pnpm test:unit

# Testes de integração
pnpm test:integration

# Testes E2E
pnpm test:e2e

# Coverage
pnpm test:coverage
```

### **Cobertura de Testes**

- **188 testes unitários** ✅
- **Cobertura: 95%+** ✅
- **TDD aplicado** em todo desenvolvimento ✅

## 🔧 **CI/CD Pipeline**

### **Workflows Automatizados**

- **CI:** Linting, testes, build
- **Code Quality:** Análise de código, cobertura
- **Security:** Vulnerabilidades, dependências
- **Deploy:** Deploy automático (configurável)
- **Monitoring:** Health checks, métricas

### **Status dos Workflows**

[![CI/CD](https://github.com/JeffyMesquita/workout-timer-api/actions/workflows/ci.yml/badge.svg)](https://github.com/JeffyMesquita/workout-timer-api/actions/workflows/ci.yml)

## 📊 **Métricas de Qualidade**

- **✅ 188 testes passando**
- **✅ 95%+ cobertura de código**
- **✅ 0 vulnerabilidades críticas**
- **✅ 100% TypeScript**
- **✅ Arquitetura Clean + SOLID**
- **✅ Docker ready**
- **✅ CI/CD configurado**

## 🎯 **Roadmap para o App**

### **Fase 1: MVP (Atual)**

- ✅ Autenticação Google/Apple
- ✅ Gestão de planos de treino
- ✅ Execução de treinos com timer
- ✅ Registro de pesos por série
- ✅ Histórico de treinos

### **Fase 2: Funcionalidades Avançadas**

- 🔄 Gráficos de progressão
- 🔄 Sugestões inteligentes de peso
- 🔄 Compartilhamento de treinos
- 🔄 Notificações de treino

### **Fase 3: Premium Features**

- 🔄 Sistema de treinadores
- 🔄 Planos personalizados
- 🔄 Análises avançadas
- 🔄 Integração com wearables

## 🤝 **Contribuição**

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 **Licença**

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais
detalhes.

## 👨‍💻 **Autor**

**Jeferson Mesquita** - [@JeffyMesquita](https://github.com/JeffyMesquita)

- **LinkedIn:** [jeffyMesquita](https://www.linkedin.com/in/jeffyMesquita)
- **Website:** [jeffymesquita.dev](https://jeffymesquita.dev)
- **Email:** je_2742@hotmail.com

---

## 🎉 **Status do Projeto**

### **✅ BACKEND 100% PRONTO PARA DESENVOLVIMENTO DO APP!**

**Todas as funcionalidades principais estão implementadas, testadas e
documentadas.**

- ✅ **API funcional** com todas as features
- ✅ **Documentação completa** (Swagger + Insomnia)
- ✅ **Testes abrangentes** (188 testes passando)
- ✅ **Arquitetura sólida** (Clean + SOLID)
- ✅ **Docker configurado** para produção
- ✅ **CI/CD funcionando** para deploy

**🚀 Pode começar o desenvolvimento do app mobile imediatamente!**

---

<div align="center">

**Desenvolvido com ❤️ por
[Jeferson Mesquita](https://github.com/JeffyMesquita)**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/JeffyMesquita)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/jeffyMesquita)
[![Website](https://img.shields.io/badge/Website-000000?style=for-the-badge&logo=About.me&logoColor=white)](https://jeffymesquita.dev)

</div>
