# 🎫 Tickzi Challenge

> Plataforma completa de gerenciamento e venda de ingressos para eventos - Desafio técnico para Desenvolvedor Full Stack Pleno

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Hono](https://img.shields.io/badge/Hono-E36002?style=for-the-badge&logo=hono&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

## 🚀 Quick Start para Avaliadores

A forma **mais rápida** de testar a aplicação:

```bash
# Clone o repositório
git clone https://github.com/dcalliari/tickzi-challenge.git
cd tickzi-challenge

# Execute com Docker (recomendado)
docker-compose up --build

# Aguarde ~2-3 minutos e acesse:
# - Frontend: http://localhost:5173
# - API: http://localhost:3000
```

**Pronto!** A aplicação completa estará rodando. ✅

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Stack Tecnológica](#-stack-tecnológica)
- [Como Executar](#-como-executar)
  - [Com Docker (Recomendado)](#opção-1-docker-recomendado)
  - [Desenvolvimento Local](#opção-2-desenvolvimento-local)
- [Arquitetura](#-arquitetura)
- [API Documentation](#-api-documentation)
- [Testes](#-testes)
- [CI/CD](#-cicd)
- [Desafios Técnicos](#-desafios-técnicos)
- [Melhorias Futuras](#-melhorias-futuras)

## 📖 Sobre o Projeto

Tickzi é uma plataforma full-stack de gerenciamento de eventos e venda de ingressos, desenvolvida como desafio técnico. O projeto implementa funcionalidades completas de autenticação, CRUD de eventos, reserva de ingressos com controle de concorrência, cache com Redis e paginação.

### Características Principais

- ✅ **Vitrine Pública**: Visualização de eventos sem necessidade de login
- ✅ **Autenticação JWT**: Sistema completo de registro e login
- ✅ **Gestão de Eventos**: CRUD completo com validações
- ✅ **Reserva de Ingressos**: Sistema transacional com proteção contra overselling
- ✅ **Cache Redis**: Otimização de performance com invalidação inteligente
- ✅ **Paginação**: Todas as listagens paginadas para melhor performance
- ✅ **Type Safety**: TypeScript end-to-end com tipos compartilhados
- ✅ **Monorepo**: Organização profissional com Turbo

## ✨ Funcionalidades

### Para Usuários

- 🎭 **Visualizar Eventos**: Navegue pela vitrine pública de eventos com ingressos disponíveis
- 👤 **Criar Conta**: Registre-se na plataforma
- 🔐 **Login Seguro**: Autenticação com JWT
- 🎟️ **Reservar Ingressos**: Garanta sua vaga em eventos (máximo 1 por evento)
- 📋 **Meus Ingressos**: Visualize todos os ingressos reservados

### Para Organizadores

- ➕ **Criar Eventos**: Adicione novos eventos com todas as informações
- ✏️ **Editar Eventos**: Atualize informações dos seus eventos
- 🗑️ **Deletar Eventos**: Remova eventos (apenas se não houver ingressos vendidos)
- 📊 **Gerenciar Eventos**: Visualize todos os seus eventos criados

### Recursos Técnicos

- ⚡ **Performance**: Cache Redis com TTL configurável
- 🔄 **Concorrência**: Transações atômicas para evitar overselling
- 📄 **Paginação**: Listagens otimizadas com metadados de navegação
- 🛡️ **Segurança**: Senhas hasheadas, tokens JWT, validação de inputs
- 🎨 **UI/UX**: Interface moderna com Tailwind CSS v4 e shadcn/ui

## 🛠️ Stack Tecnológica

### Backend

- **Runtime**: [Bun](https://bun.sh) - JavaScript runtime ultra-rápido
- **Framework**: [Hono](https://hono.dev) - Web framework leve e performático
- **Database**: [PostgreSQL 16](https://www.postgresql.org/) - Banco relacional robusto
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) - TypeScript-first ORM
- **Cache**: [Redis 7](https://redis.io/) - Cache em memória
- **Validação**: [Zod](https://zod.dev/) - Validação de schemas TypeScript
- **Auth**: JWT + bcryptjs

### Frontend

- **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/) - Build ultra-rápido
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router](https://reactrouter.com/)

### DevOps & Tools

- **Monorepo**: [Turbo](https://turbo.build/) - Build system otimizado
- **Package Manager**: [Bun](https://bun.sh)
- **Code Quality**: [Biome](https://biomejs.dev/) - Linter + Formatter
- **Containerização**: [Docker](https://www.docker.com/) + Docker Compose
- **CI/CD**: GitHub Actions
- **Database Migrations**: Drizzle Kit

## 🚀 Como Executar

### Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) e [Docker Compose](https://docs.docker.com/compose/install/) **OU**
- [Bun](https://bun.sh/docs/installation) >= 1.0
- [PostgreSQL](https://www.postgresql.org/download/) >= 16 (se não usar Docker)
- [Redis](https://redis.io/download) >= 7 (se não usar Docker)

### Opção 1: Docker (Recomendado)

**A forma mais simples e rápida:**

```bash
# Clone o repositório
git clone https://github.com/dcalliari/tickzi-challenge.git
cd tickzi-challenge

# Suba toda a stack
docker-compose up --build

# Acesse a aplicação
# Frontend: http://localhost:5173
# API: http://localhost:3000
```

### Opção 2: Desenvolvimento Local

**Para desenvolvimento com hot reload:**

```bash
# 1. Clone o repositório
git clone https://github.com/dcalliari/tickzi-challenge.git
cd tickzi-challenge

# 2. Instale as dependências
bun install

# 3. Suba PostgreSQL e Redis (via Docker)
docker-compose up postgres redis -d

# 4. Configure as variáveis de ambiente
cp server/.env.example server/.env
cp client/.env.example client/.env
# Edite os arquivos .env conforme necessário

# 5. Execute as migrations
cd server
bun run db:migrate
cd ..

# 6. Inicie toda a aplicação (Turbo gerencia client + server + shared)
bun run dev
```

## 💪 Desafios Técnicos Resolvidos

### 1. Controle de Concorrência
**Problema**: Múltiplos usuários tentando reservar o último ingresso simultaneamente.

**Solução**: Transações atômicas com `FOR UPDATE` lock no PostgreSQL.

```typescript
await db.transaction(async (tx) => {
  const [event] = await tx
    .select()
    .from(eventsInTickzi)
    .where(eq(eventsInTickzi.id, event_id))
    .for("update")  // Row-level lock
    .limit(1);
  
  // Validações + inserção do ticket + decremento de quantidade
});
```

### 2. Cache Inteligente
**Problema**: Queries frequentes ao banco sobrecarregando o sistema.

**Solução**: Redis cache com invalidação automática.

```typescript
// Cache em listagens
const cachedData = await getCachedData(cacheKey);
if (cachedData) return cachedData;

// Invalidação em mutações
await invalidateCache(`${CACHE_KEYS.EVENTS_LIST}:*`);
```

### 3. Paginação Eficiente
**Problema**: Retornar 1000+ eventos em uma única resposta.

**Solução**: Paginação com metadados e validação Zod.

```typescript
const paginationSchema = z.object({
  page: z.string().default("1").transform(Number),
  limit: z.string().default("10").transform(Number).max(100),
});
```

### 4. Type Safety End-to-End
**Problema**: Inconsistências entre frontend e backend.

**Solução**: Pacote `shared` com tipos reutilizáveis.

```typescript
// shared/src/types/index.ts
export type Event = { ... };

// Usado tanto no client quanto server
import type { Event } from 'shared';
```

## 🤝 Desenvolvimento

### Scripts Disponíveis

```bash
# Root
bun run dev          # Inicia todos os serviços
bun run build        # Build de todos os pacotes
bun run lint         # Lint com Biome
bun run format       # Format com Biome
bun run type-check   # Type check TypeScript

# Server
bun run dev:server   # Dev server com hot reload
bun run db:generate  # Gerar migrations
bun run db:migrate   # Executar migrations
bun run db:push      # Push schema (dev only)
bun run db:studio    # Drizzle Studio

# Client
bun run dev:client   # Dev client com hot reload
```

### Code Style

O projeto usa [Biome](https://biomejs.dev/) para linting e formatting:

```bash
# Format código
bun run format

# Lint código
bun run lint
```

Configuração: [biome.json](./biome.json)

## 👤 Autor

**Daniel Calliari**

- LinkedIn: [linkedin.com/in/daniel-calliari](https://linkedin.com/in/daniel-calliari)
- GitHub: [@dcalliari](https://github.com/dcalliari)
- Email: daniel@calliari.dev

## 📝 Licença

Este projeto está sob a licença MIT. Veja [LICENSE](./LICENSE) para mais detalhes.

---

<p align="center">
  Desenvolvido com ❤️ para o desafio técnico Full Stack Pleno
</p>
