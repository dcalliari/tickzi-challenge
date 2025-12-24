import "../../setup/hooks";
import { beforeAll, describe, expect, test } from "bun:test";
import type { Hono } from "hono";
import { expectUUID } from "../../helpers/assertions";

let app: Hono;

beforeAll(async () => {
	const module = await import("../../../src/index");
	app = module.default;
});

describe("Auth Routes Integration", () => {
	describe("POST /api/auth/register", () => {
		test("should register new user successfully", async () => {
			const res = await app.request("/api/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: "Test User",
					email: "test@example.com",
					password: "password123",
				}),
			});

			expect(res.status).toBe(201);
			const data = await res.json();

			expect(data.user).toBeDefined();
			expect(data.user.email).toBe("test@example.com");
			expect(data.user.name).toBe("Test User");
			expect(data.user.password_hash).toBeUndefined();
			expect(data.token).toBeDefined();
			expect(typeof data.token).toBe("string");
			expectUUID(data.user.id);
		});

		test("should reject duplicate email", async () => {
			await app.request("/api/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: "User One",
					email: "duplicate@example.com",
					password: "password123",
				}),
			});

			const res = await app.request("/api/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: "User Two",
					email: "duplicate@example.com",
					password: "different-password",
				}),
			});

			expect(res.status).toBe(409);
			const data = await res.json();
			expect(data.error).toContain("already registered");
		});

		test("should reject invalid email format", async () => {
			const res = await app.request("/api/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: "Test User",
					email: "not-an-email",
					password: "password123",
				}),
			});

			expect(res.status).toBe(400);
		});

		test("should reject password shorter than 6 characters", async () => {
			const res = await app.request("/api/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: "Test User",
					email: "test2@example.com",
					password: "12345",
				}),
			});

			expect(res.status).toBe(400);
		});

		test("should reject missing name", async () => {
			const res = await app.request("/api/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: "test3@example.com",
					password: "password123",
				}),
			});

			expect(res.status).toBe(400);
		});

		test("should handle special characters in name", async () => {
			const res = await app.request("/api/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: "José María O'Brien",
					email: "jose@example.com",
					password: "password123",
				}),
			});

			expect(res.status).toBe(201);
			const data = await res.json();
			expect(data.user.name).toBe("José María O'Brien");
		});
	});

	describe("POST /api/auth/login", () => {
		test("should login successfully with correct credentials", async () => {
			await app.request("/api/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: "Login Test",
					email: "login@example.com",
					password: "password123",
				}),
			});

			const res = await app.request("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: "login@example.com",
					password: "password123",
				}),
			});

			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.token).toBeDefined();
			expect(data.user.email).toBe("login@example.com");
			expect(data.user.name).toBe("Login Test");
			expect(data.user.password_hash).toBeUndefined();
		});

		test("should reject incorrect password", async () => {
			await app.request("/api/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: "Wrong Pass Test",
					email: "wrongpass@example.com",
					password: "correct-password",
				}),
			});

			const res = await app.request("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: "wrongpass@example.com",
					password: "wrong-password",
				}),
			});

			expect(res.status).toBe(401);
			const data = await res.json();
			expect(data.error).toBeDefined();
		});

		test("should reject non-existent email", async () => {
			const res = await app.request("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: "nonexistent@example.com",
					password: "password123",
				}),
			});

			expect(res.status).toBe(401);
			const data = await res.json();
			expect(data.error).toBeDefined();
		});

		test("should reject invalid email format", async () => {
			const res = await app.request("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: "not-an-email",
					password: "password123",
				}),
			});

			expect(res.status).toBe(400);
		});

		test("should reject empty password", async () => {
			const res = await app.request("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: "test@example.com",
					password: "",
				}),
			});

			expect(res.status).toBe(400);
		});

		test("should be case-sensitive for password", async () => {
			await app.request("/api/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: "Case Test",
					email: "case@example.com",
					password: "Password123",
				}),
			});

			const res = await app.request("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: "case@example.com",
					password: "password123",
				}),
			});

			expect(res.status).toBe(401);
		});
	});
});
