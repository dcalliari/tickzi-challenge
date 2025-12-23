import { z } from "zod";

export const paginationSchema = z.object({
	page: z
		.string()
		.optional()
		.default("1")
		.transform(Number)
		.pipe(z.number().int().positive()),
	limit: z
		.string()
		.optional()
		.default("10")
		.transform(Number)
		.pipe(z.number().int().positive().max(100)),
});
