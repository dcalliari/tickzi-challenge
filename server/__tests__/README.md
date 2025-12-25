# Tests

## Running Tests

```bash
# Requirements:
# - PostgreSQL reachable via TEST_DATABASE_URL
# - Redis is mocked (ioredis-mock), so it is NOT required

# Run all tests
bun test

# Start PostgreSQL if needed
docker compose up postgres -d
```

## Test Coverage

**Integration Tests**

- ✅ **Authentication** - Register and login
- ✅ **Event Management** - Create, list, update, delete events  
- ✅ **Public Events** - List available events with pagination
- ✅ **Ticket Booking** - Reserve tickets with concurrency control
- ✅ **Cache Strategy** - Redis caching with TTL

These tests validate all functional requirements from the challenge plus the concurrency control differential.
