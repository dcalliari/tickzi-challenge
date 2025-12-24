import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { EmptyState } from "@/components/EmptyState";
import { ManageEventCard } from "@/components/ManageEventCard";
import { PaginationControls } from "@/components/PaginationControls";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useEvents } from "@/hooks/useEvents";

export function MyEventsPage() {
	const { token } = useAuth();
	const { events, pagination, isLoading, error, fetchEvents } = useEvents({
		myEvents: true,
		token,
	});

	const handlePageChange = (newPage: number) => {
		fetchEvents(newPage);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const handleEventUpdated = () => {
		fetchEvents(pagination.page);
	};

	return (
		<AppLayout error={error}>
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h2 className="text-3xl font-bold mb-2">My Events</h2>
					<p className="text-gray-600">Events you created and can manage</p>
				</div>
				<Button asChild>
					<Link to="/events/create">Create Event</Link>
				</Button>
			</div>

			{isLoading ? (
				<div className="flex items-center justify-center min-h-[50vh]">
					<div className="text-center py-12">
						<p className="text-gray-600">Loading events...</p>
					</div>
				</div>
			) : events.length === 0 ? (
				<EmptyState
					message="You haven't created any events yet"
					actionLabel="Create your first event"
					actionPath="/events/create"
				/>
			) : (
				<>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{events.map((event) => (
							<ManageEventCard
								key={event.id}
								event={event}
								onEventUpdated={handleEventUpdated}
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
