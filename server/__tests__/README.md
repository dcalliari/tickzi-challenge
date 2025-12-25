# Tests

## Running Tests

```bash
# Run all tests (requires Docker)
bun test

# Start required services
docker compose up postgres redis -d
```

## Test Coverage

**Integration Tests (57 tests)**

- ✅ **Authentication** - Register and login
- ✅ **Event Management** - Create, list, update, delete events  
- ✅ **Public Events** - List available events with pagination
- ✅ **Ticket Booking** - Reserve tickets with concurrency control
- ✅ **Cache Strategy** - Redis caching with TTL

These tests validate all functional requirements from the challenge plus the concurrency control differential.
