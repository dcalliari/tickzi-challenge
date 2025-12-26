import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { PaginationControls } from "@/components/PaginationControls";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate } from "@/lib/formatters";
import {
	type EventTicketPurchase,
	eventsService,
} from "@/services/events.service";
import { ticketsService } from "@/services/tickets.service";

interface EventTicketsDialogProps {
	eventId: string;
	eventTitle: string;
	isOpen: boolean;
	onClose: () => void;
	onTicketsChanged?: () => void;
}

export function EventTicketsDialog({
	eventId,
	eventTitle,
	isOpen,
	onClose,
	onTicketsChanged,
}: EventTicketsDialogProps) {
	const { token } = useAuth();
	const [tickets, setTickets] = useState<EventTicketPurchase[]>([]);
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

	useEffect(() => {
		if (!isOpen) return;

		const fetchTickets = async () => {
			if (!token) {
				setError("Not authenticated");
				setIsLoading(false);
				return;
			}

			try {
				setIsLoading(true);
				setError("");
				const data = await eventsService.getEventTickets(token, eventId, 1, 10);
				setTickets(data.data || []);
				setPagination(
					data.pagination || {
						page: 1,
						limit: 10,
						total: 0,
						totalPages: 0,
						hasNextPage: false,
						hasPreviousPage: false,
					},
				);
			} catch (err) {
				console.error("Error loading tickets:", err);
				setError(err instanceof Error ? err.message : "Failed to load tickets");
			} finally {
				setIsLoading(false);
			}
		};

		fetchTickets();
	}, [isOpen, token, eventId]);

	const handlePageChange = async (newPage: number) => {
		if (!token) return;

		try {
			setIsLoading(true);
			const data = await eventsService.getEventTickets(
				token,
				eventId,
				newPage,
				10,
			);
			setTickets(data.data || []);
			setPagination(data.pagination || pagination);
		} catch (err) {
			console.error("Error loading page:", err);
			setError(err instanceof Error ? err.message : "Failed to load tickets");
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancelTicket = async (ticketId: string) => {
		if (!token) return;

		try {
			await ticketsService.deleteTicket(token, ticketId);
			toast.success("Ticket cancelled", {
				description: "The ticket has been cancelled successfully.",
			});

			const data = await eventsService.getEventTickets(
				token,
				eventId,
				pagination.page,
				10,
			);
			setTickets(data.data || []);
			setPagination(data.pagination || pagination);
			onTicketsChanged?.();
		} catch (err) {
			toast.error("Cancellation failed", {
				description:
					err instanceof Error ? err.message : "Could not cancel ticket.",
			});
		}
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
		>
			<DialogContent
				className="flex flex-col max-h-[90vh] overflow-hidden p-0 sm:max-w-2xl"
				showCloseButton={false}
			>
				<Card className="border-0 shadow-none h-full">
					<CardHeader>
						<CardTitle className="text-2xl">Tickets Sold</CardTitle>
						<CardDescription>{eventTitle}</CardDescription>
					</CardHeader>

					<CardContent className="flex-1 overflow-y-auto">
						{error && (
							<div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded mb-4">
								{error}
							</div>
						)}

						{isLoading ? (
							<div className="space-y-4">
								{Array.from({ length: 5 }).map(() => (
									<Card key={crypto.randomUUID()}>
										<CardHeader>
											<div className="flex items-start justify-between">
												<div className="flex-1">
													<Skeleton className="h-5 w-32 mb-2" />
													<Skeleton className="h-4 w-24" />
												</div>
												<div>
													<Skeleton className="h-4 w-20" />
												</div>
											</div>
										</CardHeader>
									</Card>
								))}
							</div>
						) : tickets.length === 0 ? (
							<EmptyState
								message="No tickets sold yet"
								actionLabel=""
								actionPath=""
							/>
						) : (
							<>
								<div className="mb-4">
									<p className="text-sm text-muted-foreground">
										Total tickets sold:{" "}
										<span className="font-semibold">{pagination.total}</span>
									</p>
								</div>

								<div className="space-y-4">
									{tickets.map((ticket) => (
										<Card key={ticket.id}>
											<CardHeader>
												<div className="flex items-start justify-between">
													<div>
														<CardTitle>{ticket.user.name}</CardTitle>
														<CardDescription className="mt-1">
															{ticket.user.email}
														</CardDescription>
													</div>
													<div className="text-right">
														<div className="text-sm text-muted-foreground">
															Purchased on
														</div>
														<div className="text-sm font-medium">
															{formatDate(ticket.purchased_at)}
														</div>
													</div>
												</div>
											</CardHeader>
											<CardContent>
												<div className="flex items-center justify-between gap-4">
													<div className="flex-1 p-2 bg-primary/10 rounded-md">
														<p className="text-sm text-primary font-medium">
															Ticket ID: {ticket.id.slice(0, 8)}...
														</p>
													</div>
													<ConfirmDialog
														trigger={
															<Button variant="destructive">
																Cancel Ticket
															</Button>
														}
														title="Cancel Ticket"
														description={`Are you sure you want to cancel the ticket for ${ticket.user.name}? This action cannot be undone.`}
														confirmText="Cancel Ticket"
														variant="destructive"
														onConfirm={() => handleCancelTicket(ticket.id)}
													/>
												</div>
											</CardContent>
										</Card>
									))}
								</div>

								{pagination.totalPages > 1 && (
									<div className="mt-6">
										<PaginationControls
											pagination={pagination}
											isLoading={isLoading}
											onPageChange={handlePageChange}
										/>
									</div>
								)}
							</>
						)}
					</CardContent>

					<CardFooter className="pt-4">
						<Button onClick={onClose} className="w-full" variant="secondary">
							Close
						</Button>
					</CardFooter>
				</Card>
			</DialogContent>
		</Dialog>
	);
}
