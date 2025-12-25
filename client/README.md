# Tickzi Client

Frontend web da plataforma Tickzi (React + Vite), consumindo a API do pacote `server`.

## Setup

Instale as dependências a partir da raiz do monorepo:

```sh
bun install
```

## Variáveis de ambiente

Copie o exemplo e ajuste a URL da API se necessário:

```sh
cp .env.example .env
```

- `VITE_SERVER_URL` (default: `http://localhost:3000`)

## Desenvolvimento

Via scripts da raiz (recomendado):

```sh
bun run dev:client
```

Ou diretamente no pacote:

```sh
cd client
bun run dev
```

Client por padrão sobe em http://localhost:5173

## Build

```sh
cd client
bun run build
bun run preview
```
