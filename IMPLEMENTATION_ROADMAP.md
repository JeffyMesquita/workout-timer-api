# 🗺️ Roadmap de Implementação - Workout Timer API

## 🎯 **FASE 1: Core Domain (Semana 1-2)**

**Objetivo:** Implementar as entidades e regras de negócio fundamentais

### 1.1 Entidades de Domínio

- [ ] `WorkoutPlan` entity
- [ ] `Exercise` entity
- [ ] `WorkoutSession` entity
- [ ] `ExerciseExecution` entity
- [ ] `Set` entity
- [ ] Value Objects (Duration, Weight, etc.)

### 1.2 Repositórios (Interfaces)

- [ ] `WorkoutPlanRepository`
- [ ] `ExerciseRepository`
- [ ] `WorkoutSessionRepository`
- [ ] `ExerciseExecutionRepository`
- [ ] `SetRepository`

### 1.3 Serviços de Domínio

- [ ] `WorkoutLimitService` (validação free tier)
- [ ] `WorkoutTimerService` (cronômetro e pausas)

## 🎯 **FASE 2: Use Cases Essenciais (Semana 2-3)**

**Objetivo:** Implementar os casos de uso mais críticos

### 2.1 Gestão de Planos de Treino

- [ ] `CreateWorkoutPlanUseCase` ⭐ **PRIORIDADE ALTA**
- [ ] `ListUserWorkoutPlansUseCase` ⭐ **PRIORIDADE ALTA**
- [ ] `GetWorkoutPlanDetailsUseCase` ⭐ **PRIORIDADE ALTA**
- [ ] `UpdateWorkoutPlanUseCase`
- [ ] `DeleteWorkoutPlanUseCase`

### 2.2 Gestão de Exercícios

- [ ] `AddExerciseToWorkoutPlanUseCase` ⭐ **PRIORIDADE ALTA**
- [ ] `UpdateExerciseUseCase` ⭐ **PRIORIDADE ALTA**
- [ ] `RemoveExerciseFromWorkoutPlanUseCase`
- [ ] `ReorderExercisesUseCase`

### 2.3 Validações de Negócio

- [ ] `ValidateWorkoutPlanLimitsUseCase` ⭐ **PRIORIDADE ALTA**
- [ ] `ValidateExerciseLimitsUseCase` ⭐ **PRIORIDADE ALTA**

## 🎯 **FASE 3: Execução de Treinos (Semana 3-4)**

**Objetivo:** Implementar o core da aplicação - execução de treinos

### 3.1 Controle de Sessão

- [ ] `StartWorkoutSessionUseCase` ⭐ **PRIORIDADE ALTA**
- [ ] `PauseWorkoutSessionUseCase` ⭐ **PRIORIDADE ALTA**
- [ ] `ResumeWorkoutSessionUseCase` ⭐ **PRIORIDADE ALTA**
- [ ] `CompleteWorkoutSessionUseCase` ⭐ **PRIORIDADE ALTA**
- [ ] `CancelWorkoutSessionUseCase`

### 3.2 Execução de Exercícios

- [ ] `StartExerciseExecutionUseCase` ⭐ **PRIORIDADE ALTA**
- [ ] `CompleteSetUseCase` ⭐ **PRIORIDADE ALTA**
- [ ] `UpdateSetWeightUseCase` ⭐ **PRIORIDADE ALTA**
- [ ] `FinishExerciseExecutionUseCase` ⭐ **PRIORIDADE ALTA**

## 🎯 **FASE 4: API Controllers (Semana 4-5)**

**Objetivo:** Expor funcionalidades via REST API

### 4.1 Controllers REST

- [ ] `WorkoutPlanController` ⭐ **PRIORIDADE ALTA**
- [ ] `ExerciseController` ⭐ **PRIORIDADE ALTA**
- [ ] `WorkoutSessionController` ⭐ **PRIORIDADE ALTA**
- [ ] `WorkoutHistoryController`

### 4.2 DTOs e Validações

- [ ] Request/Response DTOs
- [ ] Validation pipes
- [ ] Error handling middleware

## 🎯 **FASE 5: Testes e Qualidade (Semana 5-6)**

**Objetivo:** Garantir qualidade e cobertura de testes

### 5.1 Testes Unitários

- [ ] Domain entities tests
- [ ] Use cases tests
- [ ] Repository tests
- [ ] Service tests

### 5.2 Testes de Integração

- [ ] Controller tests
- [ ] Database integration tests
- [ ] E2E workflow tests

## 🎯 **FASE 6: Histórico e Relatórios (Semana 6-7)**

**Objetivo:** Funcionalidades de acompanhamento

### 6.1 Histórico

- [ ] `GetWorkoutHistoryUseCase`
- [ ] `GetExerciseProgressUseCase`
- [ ] `GetWorkoutStatisticsUseCase`

### 6.2 Relatórios

- [ ] Progress tracking
- [ ] Performance analytics
- [ ] Export functionality

## 🎯 **FASE 7: Funcionalidades Premium (Futuro)**

**Objetivo:** Preparar terreno para funcionalidades premium

### 7.1 Trainer Features (Base)

- [ ] `TrainerInvitation` entities
- [ ] Basic trainer-student relationship
- [ ] Permission system

### 7.2 Advanced Features

- [ ] Workout templates
- [ ] Advanced analytics
- [ ] Cloud backup

---

## 🚀 **RECOMENDAÇÃO: Por onde começar AGORA**

### **Implementação Imediata (Esta Semana):**

1. **Criar Migration do Banco:**

   ```bash
   docker-compose exec api pnpm prisma:migrate dev --name add-workout-entities
   ```

2. **Implementar Entidades de Domínio:** (Ordem de prioridade)

   - `WorkoutPlan`
   - `Exercise`
   - `WorkoutSession`
   - `ExerciseExecution`
   - `Set`

3. **Criar Repository Interfaces:**

   - Começar com `WorkoutPlanRepository`
   - Implementação Prisma correspondente

4. **Primeiro Use Case:**

   - `CreateWorkoutPlanUseCase` com validação de limites free tier

5. **Controller Básico:**
   - `WorkoutPlanController` com endpoints CRUD básicos

### **Critérios de Sucesso (MVP):**

- ✅ Usuário pode criar até 2 planos de treino (free tier)
- ✅ Cada plano pode ter até 5 exercícios
- ✅ Sistema valida limites baseado no status premium
- ✅ API REST funcional para operações básicas
- ✅ Testes unitários cobrindo regras de negócio

### **Estrutura de Pastas Recomendada:**

```
src/
├── domain/
│   ├── entities/
│   │   ├── workout-plan.entity.ts
│   │   ├── exercise.entity.ts
│   │   └── workout-session.entity.ts
│   ├── repositories/
│   │   ├── workout-plan.repository.ts
│   │   └── exercise.repository.ts
│   └── services/
│       └── workout-limit.service.ts
├── application/
│   └── use-cases/
│       ├── create-workout-plan.usecase.ts
│       └── validate-workout-limits.usecase.ts
├── infrastructure/
│   └── database/
│       └── repositories/
│           └── prisma-workout-plan.repository.ts
└── presentation/
    └── workout-plan.controller.ts
```

**🎯 Vamos começar pela implementação das entidades de domínio?**
