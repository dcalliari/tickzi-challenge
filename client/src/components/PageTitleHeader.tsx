import type { ReactNode } from "react";

interface PageTitleHeaderProps {
	title: string;
	description: string;
	action?: ReactNode;
}

export function PageTitleHeader({
	title,
	description,
	action,
}: PageTitleHeaderProps) {
	return (
		<div className="mb-6 flex items-center justify-between">
			<div>
				<h2 className="text-3xl font-bold mb-2">{title}</h2>
				<p className="text-gray-600">{description}</p>
			</div>
			{action && <div>{action}</div>}
		</div>
	);
}
