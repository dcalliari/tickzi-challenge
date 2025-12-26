import { z } from "zod";

export const createEventSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z
		.string()
		.max(500, "Description must be at most 500 characters")
		.optional(),
	date: z.string().min(1, "Date is required"),
	location: z.string().min(1, "Location is required"),
	ticket_quantity: z.number().min(1, "Ticket quantity must be at least 1"),
	ticket_price: z.number().min(0, "Ticket price must be at least 0"),
});

export const updateEventSchema = z.object({
	title: z.string().min(1, "Title is required").optional(),
	description: z
		.string()
		.max(500, "Description must be at most 500 characters")
		.optional(),
	date: z.string().min(1, "Date is required").optional(),
	location: z.string().min(1, "Location is required").optional(),
	ticket_quantity: z
		.number()
		.min(1, "Ticket quantity must be at least 1")
		.optional(),
	ticket_price: z.number().min(0, "Ticket price must be at least 0").optional(),
});
