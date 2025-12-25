import {
	buildApiUrl,
	createAuthHeaders,
	handleApiError,
} from "@/lib/api-config";

export interface Event {
	id: string;
	title: string;
	description: string | null;
	date: string;
	location: string;
	ticket_quantity: number;
	ticket_price: number;
	user_id: string;
	created_at: string;
}

export interface EventsResponse {
	data: Event[];
	pagination: Pagination;
}

export interface CreateEventRequest {
	title: string;
	description?: string;
	date: string;
	location: string;
	ticket_quantity: number;
	ticket_price: number;
}

export interface UpdateEventRequest {
	title?: string;
	description?: string;
	date?: string;
	location?: string;
	ticket_quantity?: number;
	ticket_price?: number;
}

export interface EventTicketPurchase {
	id: string;
	purchased_at: string;
	user: {
		id: string;
		name: string;
		email: string;
	};
}

export interface EventTicketsResponse {
	data: EventTicketPurchase[];
	pagination: Pagination;
}

export const eventsService = {
	async listPublicEvents(page = 1, limit = 9): Promise<EventsResponse> {
		const response = await fetch(
			buildApiUrl(`/api/events?page=${page}&limit=${limit}`),
		);

		if (!response.ok) {
			await handleApiError(response);
		}

		return response.json();
	},

	async listMyEvents(
		token: string,
		page = 1,
		limit = 9,
	): Promise<EventsResponse> {
		const response = await fetch(
			buildApiUrl(`/api/events/my-events?page=${page}&limit=${limit}`),
			{
				headers: createAuthHeaders(token),
			},
		);

		if (!response.ok) {
			await handleApiError(response);
		}

		return response.json();
	},

	async createEvent(token: string, data: CreateEventRequest): Promise<Event> {
		const response = await fetch(buildApiUrl("/api/events"), {
			method: "POST",
			headers: createAuthHeaders(token),
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			await handleApiError(response);
		}

		return response.json();
	},

	async deleteEvent(token: string, eventId: string): Promise<void> {
		const response = await fetch(buildApiUrl(`/api/events/${eventId}`), {
			method: "DELETE",
			headers: createAuthHeaders(token),
		});

		if (!response.ok) {
			await handleApiError(response);
		}
	},

	async getEventById(eventId: string): Promise<Event> {
		const response = await fetch(buildApiUrl(`/api/events/${eventId}`));

		if (!response.ok) {
			await handleApiError(response);
		}

		const result = await response.json();
		return result.data;
	},

	async updateEvent(
		token: string,
		eventId: string,
		data: UpdateEventRequest,
	): Promise<Event> {
		const response = await fetch(buildApiUrl(`/api/events/${eventId}`), {
			method: "PUT",
			headers: createAuthHeaders(token),
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			await handleApiError(response);
		}

		const result = await response.json();
		return result.data;
	},

	async getEventTickets(
		token: string,
		eventId: string,
		page = 1,
		limit = 10,
	): Promise<EventTicketsResponse> {
		const response = await fetch(
			buildApiUrl(`/api/events/${eventId}/tickets?page=${page}&limit=${limit}`),
			{
				headers: createAuthHeaders(token),
			},
		);

		if (!response.ok) {
			await handleApiError(response);
		}

		return response.json();
	},

	async searchEvents(query: string, limit = 10): Promise<Event[]> {
		const response = await fetch(
			buildApiUrl(
				`/api/events/search?q=${encodeURIComponent(query)}&limit=${limit}`,
			),
		);

		if (!response.ok) {
			await handleApiError(response);
		}

		const result = await response.json();
		return result.data || [];
	},

	async searchMyEvents(
		token: string,
		query: string,
		limit = 10,
	): Promise<Event[]> {
		const response = await fetch(
			buildApiUrl(
				`/api/events/my-events/search?q=${encodeURIComponent(query)}&limit=${limit}`,
			),
			{
				headers: createAuthHeaders(token),
			},
		);

		if (!response.ok) {
			await handleApiError(response);
		}

		const result = await response.json();
		return result.data || [];
	},
};
