import { env } from "@server/env";
import { authRoutes } from "@server/routes/auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import type { ApiErrorResponse, ApiResponse } from "shared/dist";
import { eventRoutes } from "./routes/events";

export const app = new Hono()

	.use(cors())

	.get("/", (c) => {
		return c.json({
			message: "Tickzi Challenge API is running!",
			version: "1.0.0",
			timestamp: new Date().toISOString(),
			environment: env.NODE_ENV || "development",
		});
	})

	.get("/hello", async (c) => {
		const data: ApiResponse = {
			message: "Hello BHVR!",
			success: true,
		};

		return c.json(data, { status: 200 });
	})

	.route("/api/auth", authRoutes)
	.route("/api/events", eventRoutes)

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
