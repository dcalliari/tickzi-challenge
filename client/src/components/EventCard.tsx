import { Calendar, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { formatDate, formatPrice } from "@/lib/formatters";

interface Event {
	id: string;
	title: string;
	description: string | null;
	date: string;
	location: string;
	ticket_quantity: number;
	ticket_price: number;
}

interface EventCardProps {
	event: Event;
	onBook?: (eventId: string) => void;
	isBooking?: boolean;
	showBookButton?: boolean;
	requiresAuth?: boolean;
	isReserved?: boolean;
}

export function EventCard({
	event,
	onBook,
	isBooking,
	showBookButton,
	requiresAuth,
	isReserved,
}: EventCardProps) {
	return (
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
				<div className="flex justify-between items-center pt-2 border-t">
					<div className="text-sm">
						<span className="text-gray-600">Tickets: </span>
						<span
							className={`font-semibold ${
								event.ticket_quantity > 0 ? "text-green-600" : "text-red-600"
							}`}
						>
							{event.ticket_quantity > 0
								? `${event.ticket_quantity} available`
								: "Sold out"}
						</span>
					</div>
					<div className="text-lg font-bold text-gray-900">
						{formatPrice(event.ticket_price)}
					</div>
				</div>
			</CardContent>
			{showBookButton && (
				<CardFooter>
					{requiresAuth ? (
						<Button asChild className="w-full">
							<Link to="/login">Book Ticket</Link>
						</Button>
					) : (
						<Button
							className="w-full"
							disabled={
								Boolean(isReserved) || event.ticket_quantity === 0 || isBooking
							}
							onClick={() => onBook?.(event.id)}
						>
							{isReserved
								? "Ticket reserved"
								: isBooking
									? "Booking..."
									: event.ticket_quantity === 0
										? "Sold Out"
										: "Book Ticket"}
						</Button>
					)}
				</CardFooter>
			)}
		</Card>
	);
}
