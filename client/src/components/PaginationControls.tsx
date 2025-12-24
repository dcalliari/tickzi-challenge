import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Pagination {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
}

interface PaginationControlsProps {
	pagination: Pagination;
	isLoading: boolean;
	onPageChange: (page: number) => void;
}

export function PaginationControls({
	pagination,
	isLoading,
	onPageChange,
}: PaginationControlsProps) {
	if (pagination.totalPages <= 1) return null;

	return (
		<div className="flex items-center justify-center gap-2 mt-8">
			<Button
				variant="outline"
				onClick={() => onPageChange(pagination.page - 1)}
				disabled={!pagination.hasPreviousPage || isLoading}
			>
				<ChevronLeft className="w-4 h-4 mr-1" />
				Previous
			</Button>
			<div className="flex items-center gap-2">
				{Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
					.filter(
						(pageNum) =>
							pageNum === 1 ||
							pageNum === pagination.totalPages ||
							Math.abs(pageNum - pagination.page) <= 1,
					)
					.map((pageNum, idx, arr) => {
						const prevPageNum = arr[idx - 1];
						const showEllipsis = prevPageNum && pageNum - prevPageNum > 1;

						return (
							<div key={pageNum} className="flex items-center gap-2">
								{showEllipsis && <span className="px-2">...</span>}
								<Button
									variant={pageNum === pagination.page ? "default" : "outline"}
									onClick={() => onPageChange(pageNum)}
									disabled={isLoading}
									className="w-10"
								>
									{pageNum}
								</Button>
							</div>
						);
					})}
			</div>
			<Button
				variant="outline"
				onClick={() => onPageChange(pagination.page + 1)}
				disabled={!pagination.hasNextPage || isLoading}
			>
				Next
				<ChevronRight className="w-4 h-4 ml-1" />
			</Button>
		</div>
	);
}
