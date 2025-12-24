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

export async function createTestEvent(
	token: string,
	overrides: Partial<{
		title: string;
		description: string;
		date: Date;
		location: string;
		ticket_quantity: number;
		ticket_price: number;
	}> = {},
) {
	const { default: appInstance } = await import("../../src/index");
	app = appInstance;

	const defaults = {
		title: "Test Event",
		description: "Test Description",
		date: new Date("2025-12-31").toISOString(),
		location: "Test Location",
		ticket_quantity: 100,
		ticket_price: 5000,
	};

	const res = await app.request("/api/events", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ ...defaults, ...overrides }),
	});

	const result = await res.json();
	return result.data;
}
