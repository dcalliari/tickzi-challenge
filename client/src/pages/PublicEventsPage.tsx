import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";

export function PublicEventsPage() {
	const { events, isLoading, error } = useEvents();
	const [bookingError] = useState("");

	useEffect(() => {
		if (error || bookingError) {
			toast.error("Failed to load events", {
				description: error || bookingError || "Please try again later",
			});
		}
	}, [error, bookingError]);

	if (isLoading) {
		return (
			<AppLayout>
				<div className="flex items-center justify-center min-h-[50vh]">
					<div className="text-center py-12">
						<p className="text-gray-600">Loading events...</p>
					</div>
				</div>
			</AppLayout>
		);
	}

	return (
		<AppLayout>
			<div className="mb-8">
				<h1 className="text-4xl font-bold text-gray-900">Available Events</h1>
				<p className="text-gray-600 mt-2">
					Browse and book tickets for upcoming events
				</p>
			</div>

			{events.length === 0 ? (
				<>empty</>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{events.map((event) => (
						<>cards</>
					))}
				</div>
			)}
		</AppLayout>
	);
}
