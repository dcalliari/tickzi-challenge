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
		<div className="mb-6">
			<div className="flex items-center justify-between mb-4">
				<div>
					<h2 className="text-3xl font-bold mb-2">{title}</h2>
					<p className="text-gray-600">{description}</p>
				</div>
				{(showSearch || action) && (
					<div className="flex items-center gap-3">
						{showSearch && (
							<SearchBar
								placeholder={searchPlaceholder}
								value={searchValue}
								onSearchChange={onSearchChange}
							/>
						)}
						{action && <div>{action}</div>}
					</div>
				)}
			</div>
		</div>
	);
}
