import { useVirtualizer } from "@tanstack/react-virtual";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
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

const PAGE_SIZE = 10;

const emptyPagination: Pagination = {
	page: 1,
	limit: PAGE_SIZE,
	total: 0,
	totalPages: 0,
	hasNextPage: false,
	hasPreviousPage: false,
};

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
	const [pagination, setPagination] = useState<Pagination>(emptyPagination);
	const [isLoading, setIsLoading] = useState(true);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [error, setError] = useState("");
	const listRef = useRef<HTMLDivElement | null>(null);

	const fetchPage = useCallback(
		async (page: number) => {
			if (!token) {
				throw new Error("Not authenticated");
			}

			return eventsService.getEventTickets(token, eventId, page, PAGE_SIZE);
		},
		[token, eventId],
	);

	const refreshTickets = useCallback(async () => {
		try {
			setIsLoading(true);
			setError("");
			setTickets([]);
			setPagination(emptyPagination);
			listRef.current?.scrollTo({ top: 0 });

			const data = await fetchPage(1);
			setTickets(data.data || []);
			setPagination(data.pagination || emptyPagination);
		} catch (err) {
			console.error("Error loading tickets:", err);
			setError(err instanceof Error ? err.message : "Failed to load tickets");
		} finally {
			setIsLoading(false);
		}
	}, [fetchPage]);

	useEffect(() => {
		if (!isOpen) return;
		void refreshTickets();
	}, [isOpen, refreshTickets]);

	const ticketCount = tickets.length;
	const virtualCount = useMemo(
		() => ticketCount + (pagination.hasNextPage ? 1 : 0),
		[ticketCount, pagination.hasNextPage],
	);

	const rowVirtualizer = useVirtualizer({
		count: virtualCount,
		getScrollElement: () => listRef.current,
		estimateSize: () => 170,
		overscan: 6,
	});

	const virtualItems = rowVirtualizer.getVirtualItems();

	const loadMore = useCallback(async () => {
		if (isLoading || isLoadingMore) return;
		if (!pagination.hasNextPage) return;

		try {
			setIsLoadingMore(true);
			setError("");
			const nextPage = pagination.page + 1;
			const data = await fetchPage(nextPage);
			setTickets((prev) => [...prev, ...(data.data || [])]);
			setPagination(data.pagination || pagination);
		} catch (err) {
			console.error("Error loading more tickets:", err);
			setError(
				err instanceof Error ? err.message : "Failed to load more tickets",
			);
		} finally {
			setIsLoadingMore(false);
		}
	}, [fetchPage, isLoading, isLoadingMore, pagination]);

	useEffect(() => {
		const lastItem = virtualItems.at(-1);
		if (!lastItem) return;
		if (lastItem.index >= tickets.length - 1) {
			void loadMore();
		}
	}, [virtualItems, tickets.length, loadMore]);

	const handleCancelTicket = useCallback(
		async (ticketId: string) => {
			if (!token) return;

			try {
				await ticketsService.deleteTicket(token, ticketId);
				toast.success("Ticket cancelled", {
					description: "The ticket has been cancelled successfully.",
				});

				await refreshTickets();
				onTicketsChanged?.();
			} catch (err) {
				toast.error("Cancellation failed", {
					description:
						err instanceof Error ? err.message : "Could not cancel ticket.",
				});
			}
		},
		[token, refreshTickets, onTicketsChanged],
	);

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
		>
			<DialogContent
				className="flex flex-col h-[90vh] overflow-hidden p-0 sm:max-w-2xl"
				showCloseButton={false}
			>
				<Card className="border-0 shadow-none h-full min-h-0">
					<CardHeader>
						<CardTitle className="text-2xl">Tickets Sold</CardTitle>
						<CardDescription>{eventTitle}</CardDescription>
					</CardHeader>

					<CardContent className="flex flex-col flex-1 min-h-0 overflow-hidden">
						{error && (
							<div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded mb-4">
								{error}
							</div>
						)}

						{isLoading ? (
							<div className="space-y-4">
								<div className="mb-4">
									<Skeleton className="h-4 w-48" />
								</div>

								{Array.from({ length: 2 }).map(() => (
									<Card key={crypto.randomUUID()}>
										<CardHeader>
											<div className="flex items-start justify-between">
												<div className="flex-1">
													<Skeleton className="h-6 w-48 mb-2" />
													<Skeleton className="h-4 w-32" />
												</div>
												<div className="text-right space-y-2">
													<Skeleton className="h-4 w-24" />
													<Skeleton className="h-4 w-20" />
												</div>
											</div>
										</CardHeader>
										<CardContent>
											<div className="flex items-center justify-between gap-4">
												<Skeleton className="h-10 flex-1" />
												<Skeleton className="h-10 w-32" />
											</div>
										</CardContent>
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

								<div
									ref={listRef}
									className="flex-1 min-h-0 overflow-y-auto pr-2"
								>
									<div
										className="relative w-full"
										style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
									>
										{virtualItems.map((virtualRow) => {
											const isLoaderRow = virtualRow.index >= tickets.length;

											if (isLoaderRow) {
												return (
													<div
														key={`tickets-loader-${virtualRow.index}`}
														ref={rowVirtualizer.measureElement}
														data-index={virtualRow.index}
														className="absolute left-0 top-0 w-full"
														style={{
															transform: `translateY(${virtualRow.start}px)`,
															paddingBottom: "16px",
														}}
													>
														<Card>
															<CardHeader>
																<div className="flex items-start justify-between">
																	<div className="flex-1">
																		<Skeleton className="h-6 w-48 mb-2" />
																		<Skeleton className="h-4 w-32" />
																	</div>
																	<div className="text-right space-y-2">
																		<Skeleton className="h-4 w-24" />
																		<Skeleton className="h-4 w-20" />
																	</div>
																</div>
															</CardHeader>
															<CardContent>
																<div className="flex items-center justify-between gap-4">
																	<Skeleton className="h-10 flex-1" />
																	<Skeleton className="h-10 w-32" />
																</div>
															</CardContent>
														</Card>
													</div>
												);
											}

											const ticket = tickets[virtualRow.index];
											return (
												<div
													key={ticket.id}
													ref={rowVirtualizer.measureElement}
													data-index={virtualRow.index}
													className="absolute left-0 top-0 w-full"
													style={{
														transform: `translateY(${virtualRow.start}px)`,
														paddingBottom: "16px",
													}}
												>
													<Card>
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
																	onConfirm={() =>
																		handleCancelTicket(ticket.id)
																	}
																/>
															</div>
														</CardContent>
													</Card>
												</div>
											);
										})}
									</div>
								</div>
							</>
						)}
					</CardContent>

					<CardFooter className="flex justify-end gap-2 mt-auto border-t">
						<Button variant="outline" onClick={onClose}>
							Close
						</Button>
					</CardFooter>
				</Card>
			</DialogContent>
		</Dialog>
	);
}
