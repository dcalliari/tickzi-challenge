import { useEffect, useState } from "react";
import { DateTimePicker } from "@/components/DateTimePicker";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { eventsService } from "@/services/events.service";

interface CreateEventDialogProps {
	open: boolean;
	onClose: () => void;
	onCreated?: () => void;
}

export function CreateEventDialog({
	open,
	onClose,
	onCreated,
}: CreateEventDialogProps) {
	const { token } = useAuth();
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
	const [selectedTime, setSelectedTime] = useState("10:00");
	const [location, setLocation] = useState("");
	const [ticketQuantity, setTicketQuantity] = useState("");
	const [ticketPrice, setTicketPrice] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (!open) return;
		setTitle("");
		setDescription("");
		setSelectedDate(undefined);
		setSelectedTime("10:00");
		setLocation("");
		setTicketQuantity("");
		setTicketPrice("");
		setError("");
		setIsLoading(false);
	}, [open]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		try {
			if (!token) throw new Error("Not authenticated");
			if (!selectedDate) throw new Error("Please select a date");

			const [hours, minutes] = selectedTime.split(":").map(Number);
			const dateTime = new Date(selectedDate);
			dateTime.setHours(hours, minutes, 0, 0);

			await eventsService.createEvent(token, {
				title,
				description: description || undefined,
				date: dateTime.toISOString(),
				location,
				ticket_quantity: Number.parseInt(ticketQuantity, 10),
				ticket_price: Math.round(Number.parseFloat(ticketPrice) * 100),
			});

			onCreated?.();
			onClose();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to create event");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				if (!next) onClose();
			}}
		>
			<DialogContent className="max-w-2xl p-0" showCloseButton={false}>
				<Card className="border-0 shadow-none">
					<CardHeader>
						<CardTitle>Create New Event</CardTitle>
						<CardDescription>
							Fill in the details to create a new event
						</CardDescription>
					</CardHeader>
					<form onSubmit={handleSubmit}>
						<CardContent className="space-y-4">
							{error && (
								<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
									{error}
								</div>
							)}

							<div className="space-y-2">
								<Label htmlFor="title">Event Title *</Label>
								<Input
									id="title"
									placeholder="Tickzi Meetup 2025"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="description">Description</Label>
								<Textarea
									id="description"
									placeholder="Describe your event..."
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									rows={4}
								/>
							</div>

							<DateTimePicker
								label="Event Date & Time"
								selectedDate={selectedDate}
								selectedTime={selectedTime}
								onDateChange={setSelectedDate}
								onTimeChange={setSelectedTime}
								required
							/>

							<div className="space-y-2">
								<Label htmlFor="location">Location *</Label>
								<Input
									id="location"
									placeholder="123 Street, City, State"
									value={location}
									onChange={(e) => setLocation(e.target.value)}
									required
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="quantity">Available Tickets *</Label>
									<Input
										id="quantity"
										type="number"
										min="1"
										placeholder="100"
										value={ticketQuantity}
										onChange={(e) => setTicketQuantity(e.target.value)}
										required
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="price">Ticket Price (BRL) *</Label>
									<Input
										id="price"
										type="number"
										min="0"
										step="0.01"
										placeholder="25.00"
										value={ticketPrice}
										onChange={(e) => setTicketPrice(e.target.value)}
										required
									/>
								</div>
							</div>
						</CardContent>

						<CardFooter className="flex gap-4 pt-4">
							<Button type="submit" className="flex-1" disabled={isLoading}>
								{isLoading ? "Creating..." : "Create Event"}
							</Button>
							<Button
								type="button"
								variant="secondary"
								className="flex-1"
								onClick={onClose}
							>
								Cancel
							</Button>
						</CardFooter>
					</form>
				</Card>
			</DialogContent>
		</Dialog>
	);
}
