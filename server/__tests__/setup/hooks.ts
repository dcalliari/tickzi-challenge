import { afterAll, beforeAll, beforeEach } from "bun:test";
import {
	clearDatabase,
	setupTestDatabase,
	teardownTestDatabase,
} from "./database";
import { clearRedis, setupTestRedis } from "./redis";

process.env.NODE_ENV = "test";

beforeAll(async () => {
	setupTestRedis();
	await setupTestDatabase();
	console.log("✓ Test environment initialized");
}, 10000);

afterAll(async () => {
	await teardownTestDatabase();
	console.log("✓ Test environment cleaned up");
}, 5000);

beforeEach(async () => {
	await clearDatabase();
	await clearRedis();
});
