import { z } from "zod";

export const reserveTicketSchema = z.object({
	event_id: z.string().uuid("Invalid event ID"),
});
