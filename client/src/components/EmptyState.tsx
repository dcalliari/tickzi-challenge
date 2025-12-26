import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
	message: string;
	actionLabel?: string;
	actionPath?: string;
	onAction?: () => void;
}

export function EmptyState({
	message,
	actionLabel,
	actionPath,
	onAction,
}: EmptyStateProps) {
	return (
		<Card>
			<CardContent className="py-12 text-center">
				<p className="text-muted-foreground mb-4">{message}</p>
				{actionLabel && onAction && (
					<Button type="button" onClick={onAction}>
						{actionLabel}
					</Button>
				)}
				{actionLabel && !onAction && actionPath && (
					<Button asChild>
						<Link to={actionPath}>{actionLabel}</Link>
					</Button>
				)}
			</CardContent>
		</Card>
	);
}
