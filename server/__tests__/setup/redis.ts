import RedisMock from "ioredis-mock";

let testRedis: InstanceType<typeof RedisMock>;

export function setupTestRedis() {
	testRedis = new RedisMock();
	return testRedis;
}

export async function clearRedis() {
	if (testRedis) {
		await testRedis.flushall();
	}
}
