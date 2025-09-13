# Modelo de Domínio - Workout Timer API

## 🏗️ Entidades Principais

### 1. **WorkoutPlan (Plano de Treino)**

- Representa os treinos A, B, C, D
- **Regras de Negócio:**
  - Free tier: máximo 2 planos
  - Premium: ilimitado
  - Cada plano pertence a um usuário

### 2. **Exercise (Exercício)**

- Exercícios dentro de um plano de treino
- **Regras de Negócio:**
  - Free tier: máximo 5 exercícios por plano
  - Premium: ilimitado
  - Configuração de séries, repetições, tempo de descanso

### 3. **WorkoutSession (Sessão de Treino)**

- Execução de um plano de treino específico
- Registro de quando o treino foi realizado
- Status: em andamento, pausado, finalizado, cancelado

### 4. **ExerciseExecution (Execução de Exercício)**

- Execução de um exercício específico dentro de uma sessão
- Registro de pesos, repetições reais, tempo de execução
- Séries completadas

### 5. **Set (Série)**

- Cada série executada de um exercício
- Peso utilizado, repetições realizadas, tempo de descanso

### 6. **TrainerInvitation (Convite de Treinador)**

- Para funcionalidade futura de treinadores premium
- Relacionamento entre usuário premium e seus alunos

## 🎯 Casos de Uso Principais

### Gestão de Planos de Treino

1. `CreateWorkoutPlanUseCase`
2. `UpdateWorkoutPlanUseCase`
3. `DeleteWorkoutPlanUseCase`
4. `ListUserWorkoutPlansUseCase`
5. `GetWorkoutPlanDetailsUseCase`

### Gestão de Exercícios

1. `AddExerciseToWorkoutPlanUseCase`
2. `UpdateExerciseUseCase`
3. `RemoveExerciseFromWorkoutPlanUseCase`
4. `ReorderExercisesUseCase`

### Execução de Treinos

1. `StartWorkoutSessionUseCase`
2. `PauseWorkoutSessionUseCase`
3. `ResumeWorkoutSessionUseCase`
4. `CompleteWorkoutSessionUseCase`
5. `CancelWorkoutSessionUseCase`

### Registro de Execução

1. `StartExerciseExecutionUseCase`
2. `CompleteSetUseCase`
3. `UpdateSetWeightUseCase`
4. `FinishExerciseExecutionUseCase`

### Relatórios e Histórico

1. `GetWorkoutHistoryUseCase`
2. `GetExerciseProgressUseCase`
3. `GetWorkoutStatisticsUseCase`

### Validação de Limites (Free Tier)

1. `ValidateWorkoutPlanLimitsUseCase`
2. `ValidateExerciseLimitsUseCase`
3. `CheckPremiumFeaturesUseCase`

## 🔒 Regras de Negócio

### Free Tier Limitations

- Máximo 2 planos de treino
- Máximo 5 exercícios por plano
- Histórico limitado a 30 dias
- Sem funcionalidades de treinador

### Premium Features

- Planos de treino ilimitados
- Exercícios ilimitados por plano
- Histórico completo
- Funcionalidade de treinador (futura)
- Estatísticas avançadas
- Backup na nuvem

## 🎨 Fluxo de Uso Típico

1. **Configuração Inicial:**

   - Usuário cria conta (Google/Apple)
   - Cria primeiro plano de treino (ex: "Treino A")
   - Adiciona exercícios ao plano

2. **Execução do Treino:**

   - Inicia sessão de treino
   - Para cada exercício:
     - Configura peso inicial
     - Executa séries
     - Registra peso/repetições reais
     - Respeita tempo de descanso
   - Finaliza sessão

3. **Acompanhamento:**
   - Visualiza histórico de treinos
   - Acompanha progresso por exercício
   - Analisa estatísticas de evolução
