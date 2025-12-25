import { checkDatabase } from "@server/db";
import { env } from "@server/env";
import { rateLimit } from "@server/lib/rate-limit";
import { checkRedis } from "@server/lib/redis";
import { authRoutes } from "@server/routes/auth";
import { eventRoutes } from "@server/routes/events";
import { ticketRoutes } from "@server/routes/tickets";
import type { ApiErrorResponse } from "@shared/index";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

export const app = new Hono()

	.use(cors(), logger(), rateLimit({ limit: 100 }))

	.get("/", (c) => {
		return c.json({
			message: "Tickzi Challenge API is running!",
			version: "1.0.0",
			timestamp: new Date().toISOString(),
			environment: env.NODE_ENV || "development",
		});
	})

	.get("/health", async (c) => {
		const checks = {
			database: await checkDatabase(),
			redis: await checkRedis(),
		};

		const healthy = Object.values(checks).every((status) => status === true);

		return c.json(
			{ ...checks, timestamp: new Date().toISOString() },
			{ status: healthy ? 200 : 503 },
		);
	})

	.route("/api/auth", authRoutes)
	.route("/api/events", eventRoutes)
	.route("/api/tickets", ticketRoutes)

	.onError((err, c) => {
		console.error("API Error:", err);
		const data: ApiErrorResponse = {
			error: "Internal Server Error",
			message:
				env.NODE_ENV === "development" ? err.message : "Something went wrong",
			success: false,
		};
		return c.json(data, { status: 500 });
	})

	.notFound((c) => {
		const data: ApiErrorResponse = {
			error: "Not Found",
			message: "The requested resource could not be found.",
			success: false,
		};
		return c.json(data, { status: 404 });
	});

export default app;
