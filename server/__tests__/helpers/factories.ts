import type { Hono } from "hono";

let app: Hono;

export async function createTestUser(
	email = `test-${Date.now()}@example.com`,
	password = "Test123!",
	name = "Test User",
) {
	const { default: appInstance } = await import("../../src/index");
	app = appInstance;

	const res = await app.request("/api/auth/register", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ name, email, password }),
	});

	const data = await res.json();
	return { user: data.user, token: data.token, password };
}
