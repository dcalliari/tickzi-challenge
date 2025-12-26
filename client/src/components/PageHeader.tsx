import { LogOut, Ticket } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
	user?: { name: string } | null;
	onLogout?: () => void;
}

export function PageHeader({ user, onLogout }: PageHeaderProps) {
	return (
		<header className="bg-white border-b">
			<div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
				<Link to="/">
					<h1 className="text-2xl font-bold">Tickzi</h1>
				</Link>
				<div className="flex items-center gap-4">
					{user ? (
						<>
							<span className="hidden sm:inline text-sm text-gray-600">
								Hi, {user.name}!
							</span>
							<Button asChild variant="outline">
								<Link to="/events">My Events</Link>
							</Button>
							<Button asChild variant="outline">
								<Link to="/tickets">
									<Ticket />
								</Link>
							</Button>
							<Button onClick={onLogout} className="hidden sm:inline-flex">
								Logout
							</Button>
							<Button
								onClick={onLogout}
								variant="ghost"
								size="icon"
								className="sm:hidden"
								aria-label="Logout"
							>
								<LogOut />
							</Button>
						</>
					) : (
						<>
							<Button asChild variant="outline">
								<Link to="/login">Login</Link>
							</Button>
							<Button asChild>
								<Link to="/register">Register</Link>
							</Button>
						</>
					)}
				</div>
			</div>
		</header>
	);
}
