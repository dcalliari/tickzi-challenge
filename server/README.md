# Tickzi Server

## Setup

```sh
bun install
```

## Development

```sh
# Start PostgreSQL and Redis
docker compose up postgres redis -d

# Run database migrations
bun run db:migrate

# Start dev server
bun run dev
```

Server runs at http://localhost:3000

## Database

```sh
bun run db:generate  # Generate migrations from schema
bun run db:migrate   # Apply migrations
bun run db:push      # Push schema changes (dev only)
bun run db:studio    # Open Drizzle Studio
```

## Tests

```sh
# Run all tests (requires Docker services)
bun test
```

**45 integration tests** covering:
- ✅ Authentication (register/login)
- ✅ Event management (CRUD)
- ✅ Public event listing with pagination
- ✅ Ticket booking with concurrency control
- ✅ Redis caching strategy

See [__tests__/README.md](__tests__/README.md) for details.
