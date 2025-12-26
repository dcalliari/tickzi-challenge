import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { PageTitleHeader } from "@/components/PageTitleHeader";
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
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<Ticket[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const { token } = useAuth();

	const displayTickets = searchQuery ? searchResults : tickets;
	const isLoadingState = searchQuery ? isSearching : isLoading;

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

	const handleSearchChange = async (query: string) => {
		setSearchQuery(query);

		if (!query.trim() || !token) {
			setSearchResults([]);
			return;
		}

		setIsSearching(true);
		try {
			const results = await ticketsService.searchMyTickets(token, query);
			setSearchResults(results);
		} catch (err) {
			console.error("Search error:", err);
			toast.error("Search failed", {
				description: "Could not search tickets. Please try again.",
			});
		} finally {
			setIsSearching(false);
		}
	};

	const handleCancelTicket = async (ticketId: string) => {
		if (!token) return;

		try {
			await ticketsService.deleteTicket(token, ticketId);
			toast.success("Ticket cancelled", {
				description: "Your ticket has been cancelled successfully.",
			});

			if (searchQuery) {
				setSearchResults(searchResults.filter((t) => t.id !== ticketId));
			}
			await fetchTickets(pagination.page);
		} catch (err) {
			toast.error("Cancellation failed", {
				description:
					err instanceof Error ? err.message : "Could not cancel ticket.",
			});
		}
	};

	return (
		<AppLayout error={error}>
			<PageTitleHeader
				title="My Tickets"
				description="All tickets you've reserved for upcoming events"
				searchPlaceholder="Search tickets..."
				searchValue={searchQuery}
				onSearchChange={handleSearchChange}
				action={
					<Button asChild variant="outline">
						<Link to="/">Back to Events</Link>
					</Button>
				}
			/>

			{isLoadingState ? (
				<div className="space-y-4">
					{Array.from({ length: 5 }).map(() => (
						<Card key={crypto.randomUUID()}>
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
			) : displayTickets.length === 0 ? (
				<EmptyState
					message={
						searchQuery
							? "No tickets found matching your search"
							: "You haven't reserved any tickets yet"
					}
					actionLabel="Browse Events"
					actionPath="/"
				/>
			) : (
				<>
					<div className="space-y-4">
						{displayTickets.map((ticket) => (
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
									<div className="mt-4 flex items-center justify-between gap-4">
										<div className="flex-1 p-2 bg-green-50 rounded-md">
											<p className="text-sm text-green-700 font-medium">
												✓ Ticket confirmed - ID: {ticket.id.slice(0, 8)}...
											</p>
										</div>
										<ConfirmDialog
											trigger={
												<Button variant="destructive">Cancel Ticket</Button>
											}
											title="Cancel Ticket"
											description={`Are you sure you want to cancel your ticket for "${ticket.event.title}"? This action cannot be undone.`}
											confirmText="Cancel Ticket"
											variant="destructive"
											onConfirm={() => handleCancelTicket(ticket.id)}
										/>
									</div>
								</CardContent>
							</Card>
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
