import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { eventsService } from "@/services/events.service";

export function EditEventPage() {
	const { id } = useParams<{ id: string }>();
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
	const [selectedTime, setSelectedTime] = useState("10:00");
	const [location, setLocation] = useState("");
	const [ticketQuantity, setTicketQuantity] = useState("");
	const [ticketPrice, setTicketPrice] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const { token } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		const loadEvent = async () => {
			if (!id) {
				setError("Event ID not provided");
				setIsLoading(false);
				return;
			}

			try {
				const event = await eventsService.getEventById(id);

				setTitle(event.title);
				setDescription(event.description || "");
				setLocation(event.location);
				setTicketQuantity(event.ticket_quantity.toString());
				setTicketPrice((event.ticket_price / 100).toFixed(2));

				const eventDate = new Date(event.date);
				setSelectedDate(eventDate);
				const hours = String(eventDate.getHours()).padStart(2, "0");
				const minutes = String(eventDate.getMinutes()).padStart(2, "0");
				setSelectedTime(`${hours}:${minutes}`);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to load event");
			} finally {
				setIsLoading(false);
			}
		};

		loadEvent();
	}, [id]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsSaving(true);

		try {
			if (!token || !id) throw new Error("Not authenticated");
			if (!selectedDate) throw new Error("Please select a date");

			const [hours, minutes] = selectedTime.split(":").map(Number);
			const dateTime = new Date(selectedDate);
			dateTime.setHours(hours, minutes, 0, 0);

			await eventsService.updateEvent(token, id, {
				title,
				description: description || undefined,
				date: dateTime.toISOString(),
				location,
				ticket_quantity: Number.parseInt(ticketQuantity, 10),
				ticket_price: Math.round(Number.parseFloat(ticketPrice) * 100),
			});

			navigate("/events");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to update event");
		} finally {
			setIsSaving(false);
		}
	};

	if (isLoading) {
		return (
			<AppLayout>
				<div className="max-w-2xl mx-auto">
					<Skeleton className="h-10 w-48 mb-6" />
					<Card>
						<CardHeader>
							<Skeleton className="h-7 w-40 mb-2" />
							<Skeleton className="h-4 w-64" />
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="space-y-2">
								<Skeleton className="h-4 w-20" />
								<Skeleton className="h-10 w-full" />
							</div>
							<div className="space-y-2">
								<Skeleton className="h-4 w-20" />
								<Skeleton className="h-24 w-full" />
							</div>
							<div className="grid grid-cols-2 gap-4">
								<Skeleton className="h-10 w-full" />
								<Skeleton className="h-10 w-full" />
							</div>
							<div className="space-y-2">
								<Skeleton className="h-4 w-20" />
								<Skeleton className="h-10 w-full" />
							</div>
							<div className="grid grid-cols-2 gap-4">
								<Skeleton className="h-10 w-full" />
								<Skeleton className="h-10 w-full" />
							</div>
						</CardContent>
						<CardFooter>
							<Skeleton className="h-10 w-full" />
						</CardFooter>
					</Card>
				</div>
			</AppLayout>
		);
	}

	return (
		<AppLayout error={error}>
			<div className="max-w-2xl mx-auto">
				<Card>
					<CardHeader>
						<CardTitle>Edit Event</CardTitle>
						<CardDescription>Update the details of your event</CardDescription>
					</CardHeader>
					<form onSubmit={handleSubmit}>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="title">Event Title *</Label>
								<Input
									id="title"
									placeholder="Amazing Concert 2024"
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
									placeholder="123 Main St, City, State"
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

						<CardFooter className="flex gap-4">
							<Button type="submit" className="flex-1" disabled={isSaving}>
								{isSaving ? "Saving..." : "Save Changes"}
							</Button>
							<Link to="/events" className="flex-1">
								<Button type="button" variant="secondary" className="w-full">
									Cancel
								</Button>
							</Link>
						</CardFooter>
					</form>
				</Card>
			</div>
		</AppLayout>
	);
}
