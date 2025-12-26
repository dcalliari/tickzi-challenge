import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { EmptyState } from "@/components/EmptyState";
import { ManageEventCard } from "@/components/ManageEventCard";
import { PageTitleHeader } from "@/components/PageTitleHeader";
import { PaginationControls } from "@/components/PaginationControls";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useEvents } from "@/hooks/useEvents";
import { type Event, eventsService } from "@/services/events.service";

export function MyEventsPage() {
	const { token } = useAuth();
	const { events, pagination, isLoading, error, fetchEvents } = useEvents({
		myEvents: true,
		token,
	});
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<Event[]>([]);
	const [isSearching, setIsSearching] = useState(false);

	const displayEvents = searchQuery ? searchResults : events;
	const isLoadingState = searchQuery ? isSearching : isLoading;

	const handlePageChange = (newPage: number) => {
		fetchEvents(newPage);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const handleSearchChange = async (query: string) => {
		setSearchQuery(query);

		if (!query.trim() || !token) {
			setSearchResults([]);
			return;
		}

		setIsSearching(true);
		try {
			const results = await eventsService.searchMyEvents(token, query);
			setSearchResults(results);
		} catch (err) {
			console.error("Search error:", err);
			toast.error("Search failed", {
				description: "Could not search events. Please try again.",
			});
		} finally {
			setIsSearching(false);
		}
	};

	const handleEventUpdated = () => {
		fetchEvents(pagination.page);
	};

	return (
		<AppLayout error={error}>
			<PageTitleHeader
				title="My Events"
				description="Events you created and can manage"
				searchPlaceholder="Search my events..."
				searchValue={searchQuery}
				onSearchChange={handleSearchChange}
				action={
					<Button asChild>
						<Link to="/events/create">Create Event</Link>
					</Button>
				}
			/>

			{isLoadingState ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{Array.from({ length: 6 }).map(() => (
						<div key={crypto.randomUUID()} className="space-y-3">
							<Skeleton className="h-48 w-full" />
							<Skeleton className="h-6 w-3/4" />
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-2/3" />
							<Skeleton className="h-10 w-full mt-4" />
						</div>
					))}
				</div>
			) : displayEvents.length === 0 ? (
				<EmptyState
					message={
						searchQuery
							? "No events found matching your search"
							: "You haven't created any events yet"
					}
					actionLabel="Create your first event"
					actionPath="/events/create"
				/>
			) : (
				<>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{displayEvents.map((event) => (
							<ManageEventCard
								key={event.id}
								event={event}
								onEventUpdated={handleEventUpdated}
							/>
						))}
					</div>
					{!searchQuery && (
						<PaginationControls
							pagination={pagination}
							isLoading={isLoading}
							onPageChange={handlePageChange}
						/>
					)}
				</>
			)}
		</AppLayout>
	);
}
