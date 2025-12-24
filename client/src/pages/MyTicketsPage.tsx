import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { EmptyState } from "@/components/EmptyState";
import { PaginationControls } from "@/components/PaginationControls";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate, formatPrice } from "@/lib/formatters";
import { type Ticket, ticketsService } from "@/services/tickets.service";

export function MyTicketsPage() {
	const [tickets, setTickets] = useState<Ticket[]>([]);
	const [pagination, setPagination] = useState<Pagination>({
		page: 1,
		limit: 10,
		total: 0,
		totalPages: 0,
		hasNextPage: false,
		hasPreviousPage: false,
	});
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");
	const { token } = useAuth();

	const fetchTickets = useCallback(
		async (page = 1) => {
			try {
				if (!token) throw new Error("Not authenticated");

				setIsLoading(true);
				const data = await ticketsService.listMyTickets(token, page, 10);
				setTickets(data.data || []);
				if (data.pagination) {
					setPagination(data.pagination);
				}
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to load tickets");
			} finally {
				setIsLoading(false);
			}
		},
		[token],
	);

	useEffect(() => {
		fetchTickets();
	}, [fetchTickets]);

	const handlePageChange = (newPage: number) => {
		fetchTickets(newPage);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<AppLayout error={error}>
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h2 className="text-3xl font-bold mb-2">My Tickets</h2>
					<p className="text-gray-600">
						All tickets you've reserved for upcoming events
					</p>
				</div>
				<Button asChild variant="outline">
					<Link to="/">Back to Events</Link>
				</Button>
			</div>

			{isLoading ? (
				<div className="space-y-4">
					{Array.from({ length: 5 }).map((_, i) => (
						<Card key={i}>
							<CardHeader>
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<Skeleton className="h-6 w-48 mb-2" />
										<Skeleton className="h-4 w-32" />
									</div>
									<div>
										<Skeleton className="h-6 w-20" />
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<Skeleton className="h-12 w-full" />
									<Skeleton className="h-12 w-full" />
								</div>
								<Skeleton className="h-16 w-full mt-4" />
							</CardContent>
						</Card>
					))}
				</div>
			) : tickets.length === 0 ? (
				<EmptyState
					message="You haven't reserved any tickets yet"
					actionLabel="Browse Events"
					actionPath="/"
				/>
			) : (
				<>
					<div className="space-y-4">
						{tickets.map((ticket) => (
							<Card key={ticket.id}>
								<CardHeader>
									<div className="flex items-start justify-between">
										<div>
											<CardTitle>{ticket.event.title}</CardTitle>
											<CardDescription className="mt-1">
												{formatDate(ticket.event.date)}
											</CardDescription>
										</div>
										<div className="text-right">
											<div className="text-sm text-gray-500">Ticket Price</div>
											<div className="text-xl font-bold text-blue-600">
												{formatPrice(ticket.event.ticket_price)}
											</div>
										</div>
									</div>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
										<div>
											<p className="text-gray-500">Location</p>
											<p className="font-medium">{ticket.event.location}</p>
										</div>
										<div>
											<p className="text-gray-500">Reserved on</p>
											<p className="font-medium">
												{formatDate(ticket.purchased_at)}
											</p>
										</div>
										{ticket.event.description && (
											<div className="col-span-full">
												<p className="text-gray-500">Description</p>
												<p className="font-medium">
													{ticket.event.description}
												</p>
											</div>
										)}
									</div>
									<div className="mt-4 p-3 bg-green-50 rounded-md">
										<p className="text-sm text-green-700 font-medium">
											✓ Ticket confirmed - ID: {ticket.id.slice(0, 8)}...
										</p>
									</div>
								</CardContent>
							</Card>
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
