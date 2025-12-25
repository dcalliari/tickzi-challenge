import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { EmptyState } from "@/components/EmptyState";
import { EventCard } from "@/components/EventCard";
import { PageTitleHeader } from "@/components/PageTitleHeader";
import { PaginationControls } from "@/components/PaginationControls";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useEvents } from "@/hooks/useEvents";
import { ticketsService } from "@/services/tickets.service";

export function PublicEventsPage() {
	const { user, token } = useAuth();
	const { events, pagination, isLoading, error, fetchEvents } = useEvents();
	const [bookingEventId, setBookingEventId] = useState<string | null>(null);
	const [bookingError, setBookingError] = useState("");
	const navigate = useNavigate();

	const handlePageChange = (newPage: number) => {
		fetchEvents(newPage);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const handleBookTicket = async (eventId: string) => {
		setBookingEventId(eventId);
		setBookingError("");

		try {
			if (!token) throw new Error("Not authenticated");

			await ticketsService.bookTicket(token, { event_id: eventId });
			await fetchEvents();
			toast.success("Ticket booked successfully!");
			navigate("/tickets");
		} catch (err) {
			setBookingError(
				err instanceof Error ? err.message : "Failed to book ticket",
			);
		} finally {
			setBookingEventId(null);
		}
	};

	useEffect(() => {
		if (error || bookingError) {
			toast.error("Failed to load events", {
				description: error || bookingError || "Please try again later",
			});
		}
	}, [error, bookingError]);

	const header = (
		<PageTitleHeader
			title="Available Events"
			description="Browse and book tickets for upcoming events"
		/>
	);

	if (isLoading) {
		return (
			<AppLayout>
				{header}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{Array.from({ length: 6 }).map((_, i) => (
						<div key={i} className="space-y-3">
							<Skeleton className="h-48 w-full" />
							<Skeleton className="h-6 w-3/4" />
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-2/3" />
						</div>
					))}
				</div>
			</AppLayout>
		);
	}

	return (
		<AppLayout>
			{header}
			{events.length === 0 ? (
				<EmptyState
					message="No events available yet. Check back later to see new events!"
					actionLabel={user ? "Create Event" : "Login to Create Event"}
					actionPath={user ? "/events/create" : "/login"}
				/>
			) : (
				<>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{events.map((event) => (
							<EventCard
								key={event.id}
								event={event}
								showBookButton
								requiresAuth={!user}
								onBook={handleBookTicket}
								isBooking={bookingEventId === event.id}
							/>
						))}
					</div>
					<PaginationControls
						pagination={pagination}
						isLoading={isLoading}
						onPageChange={handlePageChange}
					/>
				</>
			)}
		</AppLayout>
	);
}
