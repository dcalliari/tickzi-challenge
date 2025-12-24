import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
	message: string;
	actionLabel?: string;
	actionPath?: string;
}

export function EmptyState({
	message,
	actionLabel,
	actionPath,
}: EmptyStateProps) {
	return (
		<Card>
			<CardContent className="py-12 text-center">
				<p className="text-gray-600 mb-4">{message}</p>
				{actionLabel && actionPath && (
					<Button asChild>
						<Link to={actionPath}>{actionLabel}</Link>
					</Button>
				)}
			</CardContent>
		</Card>
	);
}
