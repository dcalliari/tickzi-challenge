import {
	buildApiUrl,
	createAuthHeaders,
	handleApiError,
} from "@/lib/api-config";

export interface Ticket {
	id: string;
	purchased_at: string;
	event: {
		id: string;
		title: string;
		description: string | null;
		date: string;
		location: string;
		ticket_price: number;
	};
}

export interface TicketsResponse {
	data: Ticket[];
	pagination: Pagination;
}

export interface BookTicketRequest {
	event_id: string;
}

export const ticketsService = {
	async listMyTickets(
		token: string,
		page = 1,
		limit = 10,
	): Promise<TicketsResponse> {
		const response = await fetch(
			buildApiUrl(`/api/tickets?page=${page}&limit=${limit}`),
			{
				headers: createAuthHeaders(token),
			},
		);

		if (!response.ok) {
			await handleApiError(response);
		}

		return response.json();
	},

	async bookTicket(token: string, data: BookTicketRequest): Promise<Ticket> {
		const response = await fetch(buildApiUrl("/api/tickets"), {
			method: "POST",
			headers: createAuthHeaders(token),
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			await handleApiError(response);
		}

		return response.json();
	},
};
