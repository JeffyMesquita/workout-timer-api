# 🔧 **CONFIGURAÇÃO DE EDITOR - WORKOUT TIMER API**

## 🎯 **CONFIGURAÇÕES PADRONIZADAS**

Este projeto utiliza **EditorConfig** para manter consistência entre diferentes
editores e sistemas operacionais.

---

## 📝 **ARQUIVOS DE CONFIGURAÇÃO**

### **`.editorconfig`**

- ✅ **End of Line:** LF (Unix) para todos os arquivos
- ✅ **Charset:** UTF-8
- ✅ **Indentation:** 2 espaços para TypeScript/JavaScript
- ✅ **Max Line Length:** 100 caracteres
- ✅ **Trim Whitespace:** Remove espaços em branco no final
- ✅ **Final Newline:** Adiciona quebra de linha no final

### **`.gitattributes`**

- ✅ **Normalização:** LF para arquivos de código
- ✅ **Detecção automática** de arquivos texto
- ✅ **Tratamento especial** para arquivos Windows (.bat, .cmd)

### **`.prettierrc`**

- ✅ **Alinhado com EditorConfig**
- ✅ **End of Line:** LF forçado
- ✅ **Single Quotes:** Aspas simples
- ✅ **Trailing Commas:** Sempre
- ✅ **Print Width:** 100 caracteres

---

## 🛠️ **CONFIGURAÇÃO POR EDITOR**

### **Visual Studio Code**

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "files.eol": "\n",
  "files.insertFinalNewline": true,
  "files.trimTrailingWhitespace": true,
  "prettier.endOfLine": "lf"
}
```

### **WebStorm/IntelliJ**

- ✅ **EditorConfig plugin** (já vem instalado)
- ✅ **Prettier integration** habilitada
- ✅ **ESLint integration** habilitada
- ✅ **Line separators:** LF - Unix and macOS (\n)

### **Cursor**

- ✅ **EditorConfig** suportado nativamente
- ✅ **Prettier** extension instalada
- ✅ **ESLint** extension instalada
- ✅ Configurações automáticas via `.editorconfig`

---

## 🔄 **NORMALIZAÇÃO AUTOMÁTICA**

### **Git Hooks (Husky)**

```bash
# Pre-commit
✅ ESLint --fix (corrige imports e formatação)
✅ Prettier --write (formata código)
✅ TypeScript check (verifica compilação)
✅ Unit tests (executa 189 testes)

# Commit-msg
✅ Conventional Commits (valida formato)
```

### **Lint-staged**

```json
{
  "src/**/*.{ts,tsx}": [
    "eslint --fix", // Organiza imports, remove não utilizados
    "prettier --write" // Formata código com LF
  ],
  "src/**/*.{json,md}": [
    "prettier --write" // Formata arquivos de configuração
  ]
}
```

---

## 🎯 **REGRAS ESPECÍFICAS**

### **TypeScript/JavaScript**

```
✅ Indentação: 2 espaços
✅ Quebra de linha: LF
✅ Charset: UTF-8
✅ Linha final: Obrigatória
✅ Trim whitespace: Sim
✅ Max line length: 100 chars
```

### **Markdown**

```
✅ Indentação: 2 espaços
✅ Max line length: 80 chars
✅ Trim whitespace: Não (preserva formatação)
```

### **YAML (GitHub Actions)**

```
✅ Indentação: 2 espaços
✅ Quebra de linha: LF
✅ Charset: UTF-8
```

### **Prisma Schema**

```
✅ Indentação: 2 espaços
✅ Quebra de linha: LF
```

---

## 🚨 **PROBLEMAS COMUNS E SOLUÇÕES**

### **Problema: Quebras de linha inconsistentes**

**Solução:**

```bash
# Normalizar todos os arquivos
git add --renormalize .
git commit -m "fix: normalize line endings"
```

### **Problema: Editor não respeitando .editorconfig**

**Soluções:**

- **VSCode:** Instalar extensão "EditorConfig for VS Code"
- **WebStorm:** Plugin já vem instalado
- **Cursor:** Suporte nativo
- **Outros:** Verificar se o plugin EditorConfig está instalado

### **Problema: Prettier conflitando com EditorConfig**

**Solução:**

```bash
# Verificar configuração
pnpm prettier --check "src/**/*.{ts,tsx}"

# Aplicar formatação
pnpm format
```

---

## ✅ **VERIFICAÇÃO DE CONFIGURAÇÃO**

### **Comandos de Teste**

```bash
# Verificar formatação
pnpm format:check

# Verificar lint
pnpm lint:check

# Verificar TypeScript
pnpm type-check

# Verificar tudo
pnpm quality:check
```

### **Teste de Commit**

```bash
# Adicionar arquivos
git add .

# Commit (hooks executam automaticamente)
git commit -m "feat: test editor config"
```

---

## 🎉 **BENEFÍCIOS**

### **✅ Consistência Total:**

- **Entre desenvolvedores** - Mesmo estilo de código
- **Entre editores** - Configuração padronizada
- **Entre sistemas** - LF em todos os SOs

### **✅ Automação:**

- **Formatação automática** no save
- **Correção automática** no commit
- **Validação automática** no CI/CD

### **✅ Qualidade:**

- **Código limpo** sempre
- **Imports organizados** automaticamente
- **Padrões consistentes** em todo projeto

---

## 🔧 **MANUTENÇÃO**

### **Atualizar Configurações:**

1. Editar `.editorconfig` conforme necessário
2. Sincronizar `.prettierrc` com mudanças
3. Atualizar `.gitattributes` se necessário
4. Testar com `pnpm quality:check`

### **Adicionar Novos Tipos de Arquivo:**

1. Adicionar regra em `.editorconfig`
2. Adicionar em `.gitattributes` se necessário
3. Atualizar `lint-staged` se aplicável

---

**🎯 RESULTADO: CONFIGURAÇÃO PERFEITA PARA DESENVOLVIMENTO EM EQUIPE!** ✨
