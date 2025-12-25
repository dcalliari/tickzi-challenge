import { useCallback, useEffect, useState } from "react";
import {
	type Event,
	eventsService,
} from "@/services/events.service";

interface UseEventsOptions {
	myEvents?: boolean;
	token?: string | null;
	autoFetch?: boolean;
}

export function useEvents({
	myEvents = false,
	token,
	autoFetch = true,
}: UseEventsOptions = {}) {
	const [events, setEvents] = useState<Event[]>([]);
	const [pagination, setPagination] = useState<Pagination>({
		page: 1,
		limit: 9,
		total: 0,
		totalPages: 0,
		hasNextPage: false,
		hasPreviousPage: false,
	});
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");

	const fetchEvents = useCallback(
		async (page = 1) => {
			try {
				setIsLoading(true);
				setError("");

				const data =
					myEvents && token
						? await eventsService.listMyEvents(token, page, 9)
						: await eventsService.listPublicEvents(page, 9);

				setEvents(data.data || []);
				if (data.pagination) {
					setPagination(data.pagination);
				}
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to load events");
			} finally {
				setIsLoading(false);
			}
		},
		[myEvents, token],
	);

	useEffect(() => {
		if (autoFetch) {
			fetchEvents();
		}
	}, [fetchEvents, autoFetch]);

	return {
		events,
		pagination,
		isLoading,
		error,
		fetchEvents,
	};
}
