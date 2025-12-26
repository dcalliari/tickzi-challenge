import type { ReactNode } from "react";
import { SearchBar } from "@/components/SearchBar";

interface PageTitleHeaderProps {
	title: string;
	description: string;
	action?: ReactNode;
	searchPlaceholder?: string;
	searchValue?: string;
	onSearchChange?: (value: string) => void;
}

export function PageTitleHeader({
	title,
	description,
	action,
	searchPlaceholder = "Search...",
	searchValue,
	onSearchChange,
}: PageTitleHeaderProps) {
	const showSearch = onSearchChange !== undefined;

	return (
		<div className="mb-6 px-2 sm:px-1">
			<div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between mb-4">
				<div className="min-w-0">
					<h2 className="text-xl sm:text-3xl font-bold leading-tight">
						{title}
					</h2>
					<p className="hidden md:block text-muted-foreground">{description}</p>
				</div>
				{(showSearch || action) && (
					<div className="w-full sm:w-auto min-w-0">
						<div className="flex items-center gap-3 sm:justify-end min-w-0">
							{showSearch && (
								<div className="flex-1 min-w-0">
									<SearchBar
										placeholder={searchPlaceholder}
										value={searchValue}
										onSearchChange={onSearchChange}
										className="w-full sm:w-64"
									/>
								</div>
							)}
							{action && <div className="shrink-0">{action}</div>}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
