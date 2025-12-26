import { Calendar, Edit, MapPin, Ticket, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EventTicketsDialog } from "@/components/EventTicketsDialog";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate, formatPrice } from "@/lib/formatters";
import { type Event, eventsService } from "@/services/events.service";

interface ManageEventCardProps {
	event: Event;
	onEventUpdated: () => void;
	onEdit: (event: Event) => void;
}

export function ManageEventCard({
	event,
	onEventUpdated,
	onEdit,
}: ManageEventCardProps) {
	const { token } = useAuth();
	const [isDeleting, setIsDeleting] = useState(false);
	const [showTicketsDialog, setShowTicketsDialog] = useState(false);
	const [ticketsChanged, setTicketsChanged] = useState(false);

	const handleEdit = () => {
		onEdit(event);
	};

	const handleDelete = async () => {
		if (!token) return;

		setIsDeleting(true);
		try {
			await eventsService.deleteEvent(token, event.id);
			onEventUpdated();
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Failed to delete event",
			);
		} finally {
			setIsDeleting(false);
		}
	};

	const handleViewTickets = () => {
		setShowTicketsDialog(true);
	};

	const handleCloseTicketsDialog = () => {
		setShowTicketsDialog(false);
		if (ticketsChanged) {
			setTicketsChanged(false);
			onEventUpdated();
		}
	};

	return (
		<>
			<Card className="hover:shadow-lg transition-shadow flex flex-col">
				<CardHeader>
					<CardTitle className="text-xl">{event.title}</CardTitle>
					<CardDescription className="flex items-center gap-2">
						<Calendar className="w-4 h-4" />
						{formatDate(event.date)}
					</CardDescription>
				</CardHeader>
				<CardContent className="flex-1 space-y-3">
					{event.description && (
						<p className="text-gray-700 text-sm line-clamp-3">
							{event.description}
						</p>
					)}
					<div className="flex items-center gap-2 text-gray-600 text-sm">
						<MapPin className="w-4 h-4" />
						{event.location}
					</div>
					<div className="space-y-1 pt-2 border-t">
						<div className="flex justify-between items-center text-sm">
							<span className="text-gray-600">Price per ticket:</span>
							<span className="font-semibold text-gray-900">
								{formatPrice(event.ticket_price)}
							</span>
						</div>
						<div className="flex justify-between items-center text-sm">
							<span className="text-gray-600">Available tickets:</span>
							<span
								className={`font-semibold ${
									event.ticket_quantity > 0 ? "text-green-600" : "text-red-600"
								}`}
							>
								{event.ticket_quantity}
							</span>
						</div>
					</div>
				</CardContent>
				<CardFooter className="flex flex-col gap-2">
					<Button
						variant="outline"
						className="w-full"
						onClick={handleViewTickets}
					>
						<Ticket className="w-4 h-4 mr-2" />
						View Tickets Sold
					</Button>
					<div className="flex gap-2 w-full">
						<Button variant="outline" className="flex-1" onClick={handleEdit}>
							<Edit className="w-4 h-4 mr-2" />
							Edit
						</Button>
						<ConfirmDialog
							trigger={
								<Button
									variant="destructive"
									className="flex-1"
									disabled={isDeleting}
								>
									<Trash2 className="w-4 h-4 mr-2" />
									{isDeleting ? "Deleting..." : "Delete"}
								</Button>
							}
							title="Delete Event"
							description={`Are you sure you want to delete "${event.title}"? This action cannot be undone and will permanently remove the event and all associated data.`}
							confirmText="Delete Event"
							cancelText="Cancel"
							onConfirm={handleDelete}
							variant="destructive"
						/>
					</div>
				</CardFooter>
			</Card>

			<EventTicketsDialog
				eventId={event.id}
				eventTitle={event.title}
				isOpen={showTicketsDialog}
				onClose={handleCloseTicketsDialog}
				onTicketsChanged={() => setTicketsChanged(true)}
			/>
		</>
	);
}
