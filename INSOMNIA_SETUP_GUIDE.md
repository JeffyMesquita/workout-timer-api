# 📱 Guia de Configuração do Insomnia - Workout Timer API

## 🚀 **COMO USAR A COLEÇÃO**

### **1. Importar no Insomnia**

1. Abra o **Insomnia**
2. Clique em **"Create"** → **"Import from"** → **"File"**
3. Selecione o arquivo `insomnia-collection.json`
4. A coleção será importada com todas as rotas organizadas! 🎉

### **2. Configurar Environment**

1. Clique no **ícone de engrenagem** (⚙️) no canto superior direito
2. Selecione **"Manage Environments"**
3. Configure as variáveis:

```json
{
  "base_url": "http://localhost:3000",
  "access_token": "",
  "refresh_token": "",
  "google_id_token": "",
  "apple_id_token": "",
  "purchase_token": "",
  "workout_plan_id": "",
  "workout_session_id": "",
  "exercise_id": "",
  "exercise_execution_id": "",
  "set_id": ""
}
```

### **3. Fluxo de Teste Recomendado**

#### **🔐 Passo 1: Autenticação**

1. **Login Google** ou **Login Apple**
2. Copie o `access_token` da resposta
3. Cole no environment: `access_token`

#### **🏋️‍♂️ Passo 2: Criar Plano de Treino**

1. **Criar Plano de Treino**
2. Copie o `id` da resposta
3. Cole no environment: `workout_plan_id`

#### **💪 Passo 3: Adicionar Exercícios**

1. **Adicionar Exercício** (use o `workout_plan_id`)
2. Copie o `id` do exercício
3. Cole no environment: `exercise_id`

#### **⏱️ Passo 4: Iniciar Treino**

1. **Iniciar Treino** (use o `workout_plan_id`)
2. Copie o `id` da sessão
3. Cole no environment: `workout_session_id`

#### **🏋️‍♂️ Passo 5: Executar Exercício**

1. **Iniciar Exercício** (use `workout_session_id` e `exercise_id`)
2. Copie o `id` da execução
3. Cole no environment: `exercise_execution_id`

#### **⚖️ Passo 6: Completar Séries**

1. **Completar Série** (use `exercise_execution_id`)
2. Teste diferentes pesos e repetições!

---

## 📁 **ESTRUTURA DA COLEÇÃO**

### **🔐 Autenticação**

- **🔐 Login Google** - Autenticação via Google OAuth
- **🍎 Login Apple** - Autenticação via Apple Sign In
- **🔄 Refresh Token** - Renovar access token

### **💳 Assinaturas**

- **💳 Ativar Assinatura** - Ativar premium via Google Play
- **🔄 Restaurar Assinatura** - Restaurar compra existente
- **📊 Status Premium** - Verificar status da assinatura

### **🏋️‍♂️ Planos de Treino**

- **➕ Criar Plano de Treino** - Criar novo plano
- **📋 Listar Planos** - Listar todos os planos
- **🔍 Buscar Plano** - Buscar plano específico
- **✏️ Atualizar Plano** - Editar plano existente
- **🗑️ Deletar Plano** - Remover plano

### **💪 Exercícios**

- **💪 Listar Exercícios** - Listar exercícios de um plano
- **➕ Adicionar Exercício** - Adicionar exercício ao plano

### **⏱️ Sessões de Treino**

- **▶️ Iniciar Treino** - Começar nova sessão
- **⏸️ Pausar Treino** - Pausar sessão ativa
- **▶️ Retomar Treino** - Continuar sessão pausada
- **✅ Finalizar Treino** - Concluir sessão
- **❌ Cancelar Treino** - Cancelar sessão
- **🔍 Treino Ativo** - Buscar sessão ativa
- **📊 Detalhes do Treino** - Detalhes da sessão

### **🏋️‍♂️ Execução de Exercícios**

- **▶️ Iniciar Exercício** - Começar exercício
- **⚖️ Completar Série** - **COM PESO E REPS!** ⭐
- **✅ Finalizar Exercício** - Concluir exercício
- **🔍 Detalhes da Execução** - Detalhes da execução
- **📊 Séries do Exercício** - Listar séries
- **📈 Histórico do Exercício** - Histórico de execuções

### **⚖️ Séries e Pesos**

- **⚖️ Atualizar Peso** - Editar peso de uma série

### **🏥 Health Checks**

- **🏥 Health Check** - Verificar API
- **🗄️ Database Health** - Verificar banco

---

## 🎯 **FUNCIONALIDADES PRINCIPAIS TESTÁVEIS**

### **✅ 1. Autenticação Completa**

- Google OAuth
- Apple Sign In
- Refresh de tokens

### **✅ 2. Gestão de Planos**

- CRUD completo
- Validação de limites (free vs premium)

### **✅ 3. Execução de Treinos**

- Controle completo de sessões
- Pausar/retomar
- Timer automático

### **✅ 4. Registro de Pesos** ⭐

- **Peso por série**
- **Repetições reais vs planejadas**
- **Tempo de descanso**
- **Notas por série**

### **✅ 5. Histórico e Estatísticas**

- Progressão de peso
- Volume total
- Taxa de conclusão

---

## 🔧 **CONFIGURAÇÕES IMPORTANTES**

### **Base URL**

- **Desenvolvimento:** `http://localhost:3000`
- **Docker:** `http://localhost:3000`
- **Produção:** `https://api.workout-timer.com`

### **Headers Automáticos**

- `Content-Type: application/json`
- `Authorization: Bearer {{ _.access_token }}`

### **Variáveis de Ambiente**

Todas as variáveis são preenchidas automaticamente conforme você usa a API!

---

## 🚨 **DICAS IMPORTANTES**

### **1. Ordem de Execução**

Sempre siga a ordem recomendada para evitar erros de dependência.

### **2. IDs Dinâmicos**

Os IDs são preenchidos automaticamente nas respostas. Use-os para os próximos
requests!

### **3. Teste de Limites**

- **Free Tier:** 2 planos, 5 exercícios por plano
- **Premium:** Ilimitado

### **4. Registro de Pesos**

O endpoint **"⚖️ Completar Série"** é o coração da API - teste bem!

---

## 🎉 **PRONTO PARA USAR!**

A coleção está **100% configurada** e pronta para testar todas as
funcionalidades da API!

**Só importar e começar a testar!** 🚀💪

---

## 📚 **DOCUMENTAÇÃO ADICIONAL**

- **Swagger UI:** `http://localhost:3000/api`
- **Health Check:** `http://localhost:3000/health`
- **Database Health:** `http://localhost:3000/health/database`

**Boa sorte testando a API!** 🎯✨
